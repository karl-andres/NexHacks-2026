"""
TRELLIS Text-to-3D on Modal

Model weights cached in Volume for fast cold starts (~10s vs ~2min).

Usage:
    modal run trellis_modal.py::download_models    # Download models first
    modal deploy trellis_modal.py                   # Deploy API
    modal run trellis_modal.py --prompt "a robot"   # Test locally
"""

import os
from pathlib import Path

import modal

volume = modal.Volume.from_name("trellis-weights", create_if_missing=True)
MODEL_DIR = Path("/models")
TRELLIS_REPO = "JeffreyXiang/TRELLIS-text-xlarge"

# Image with all TRELLIS dependencies
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install(
        "git", "libgl1-mesa-glx", "libglib2.0-0", "libsm6",
        "libxext6", "libxrender-dev", "libgomp1", "wget",
    )
    .pip_install(
        "torch==2.4.0",
        "torchvision==0.19.0",
        "numpy<2",
        "pillow",
        "imageio",
        "imageio-ffmpeg",
        "trimesh",
        "transformers",
        "huggingface_hub",
        "hf_transfer",
        "safetensors",
        "einops",
        "scipy",
        "tqdm",
        "plyfile",
        "open3d",
        "rembg",
        "onnxruntime",
        "xformers==0.0.27.post2",
        "spconv-cu120",
        "fastapi[standard]",
        extra_index_url="https://download.pytorch.org/whl/cu121",
    )
    .run_commands(
        "git clone --recurse-submodules https://github.com/microsoft/TRELLIS.git /trellis",
        # Install TRELLIS dependencies
        "pip install easydict utils3d kaolin -f https://nvidia-kaolin.s3.us-east-2.amazonaws.com/torch-2.4.0_cu121.html",
        "cd ./trellis && . ./setup.sh --basic --xformers --flash-attn --diffoctreerast --spconv --mipgaussian --kaolin --nvdiffrast",
        "ls"
    )
    .env({
        "ATTN_BACKEND": "xformers",
        "SPCONV_ALGO": "native",
        "HF_HUB_ENABLE_HF_TRANSFER": "1",
        "PYTHONPATH": "/trellis",
    })
)

app = modal.App("trellis-3d", image=image)


@app.function(volumes={MODEL_DIR: volume}, timeout=3600)
def download_models():
    """Download and cache TRELLIS model weights to Volume."""
    from huggingface_hub import snapshot_download

    model_path = MODEL_DIR / "trellis-text-xlarge"

    print(f"Downloading {TRELLIS_REPO}...")
    snapshot_download(
        repo_id=TRELLIS_REPO,
        local_dir=model_path,
        ignore_patterns=["*.md", "*.txt", "*.png", "*.jpg"],
    )

    volume.commit()
    print(f"Model cached at {model_path}")


@app.cls(
    gpu="A100-40GB",
    volumes={MODEL_DIR: volume},
    timeout=600,
    scaledown_window=300,
)
class Trellis3D:
    """TRELLIS 3D generation with warm model loading."""

    @modal.enter()
    def load_model(self):
        """Load model once when container starts."""
        import sys
        if "/trellis" not in sys.path:
            sys.path.insert(0, "/trellis")

        from trellis.pipelines import TrellisTextTo3DPipeline

        model_path = MODEL_DIR / "trellis-text-xlarge"

        if not model_path.exists():
            raise RuntimeError(
                "Model not found. Run: modal run trellis_modal.py::download_models"
            )

        print("Loading TRELLIS pipeline...")
        self.pipeline = TrellisTextTo3DPipeline.from_pretrained(str(model_path))
        self.pipeline.cuda()
        print("Pipeline ready!")

    @modal.method()
    def generate(
        self,
        prompt: str,
        seed: int = 42,
        output_format: str = "glb",
    ) -> bytes:
        """
        Generate 3D model from text prompt.

        Args:
            prompt: Text description of the 3D object
            seed: Random seed
            output_format: "glb", "stl", or "ply"

        Returns:
            Binary 3D model data
        """
        import tempfile
        import torch

        print(f"Generating: {prompt}")

        torch.manual_seed(seed)
        outputs = self.pipeline.run(
            prompt,
            seed=seed,
            sparse_structure_sampler_params={"steps": 12, "cfg_strength": 7.5},
            slat_sampler_params={"steps": 12, "cfg_strength": 3},
        )

        with tempfile.TemporaryDirectory() as tmpdir:
            if output_format == "glb":
                from trellis.utils import postprocessing_utils
                glb = postprocessing_utils.to_glb(
                    outputs["gaussian"][0],
                    outputs["mesh"][0],
                    simplify=0.95,
                    texture_size=1024,
                )
                path = f"{tmpdir}/model.glb"
                glb.export(path)

            elif output_format == "stl":
                import trimesh
                mesh = outputs["mesh"][0]
                verts = mesh.vertices.cpu().numpy()
                faces = mesh.faces.cpu().numpy()
                tri = trimesh.Trimesh(vertices=verts, faces=faces)
                path = f"{tmpdir}/model.stl"
                tri.export(path)

            elif output_format == "ply":
                path = f"{tmpdir}/model.ply"
                outputs["gaussian"][0].save_ply(path)
            else:
                raise ValueError(f"Unknown format: {output_format}")

            with open(path, "rb") as f:
                return f.read()


@app.function()
@modal.fastapi_endpoint(method="POST", docs=True)
def generate_stl(data: dict):
    """
    POST /generate_stl
    Body: {"description": "a red cube", "seed": 42}
    Returns: Binary STL data
    """
    from fastapi.responses import Response

    description = data.get("description", "a simple cube")
    seed = data.get("seed", 42)
    output_format = data.get("format", "stl")

    model = Trellis3D()
    result = model.generate.remote(
        prompt=description,
        seed=seed,
        output_format=output_format,
    )

    return Response(
        content=result,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="model.{output_format}"'},
    )


@app.local_entrypoint()
def main(prompt: str = "a futuristic robot", output: str = "model.glb"):
    """Test generation locally."""
    model = Trellis3D()

    fmt = output.split(".")[-1]
    result = model.generate.remote(prompt=prompt, output_format=fmt)

    with open(output, "wb") as f:
        f.write(result)
    print(f"Saved to {output}")
