# TRELLIS 3D Generation Backend

Modal deployment for Microsoft TRELLIS text-to-3D model.

## Setup

1. Install Modal CLI:
```bash
pip install modal
modal token new
```

2. Download model weights (run once, ~5-10min):
```bash
cd backend
modal run trellis_modal.py::download_models
```

3. Deploy the API:
```bash
modal deploy trellis_modal.py
```

4. Copy the endpoint URL and add to `.env.local`:
```
STL_API_URL=https://your-workspace--trellis-3d-generate-stl.modal.run
```

## Usage

### Test locally
```bash
modal run trellis_modal.py --prompt "a red sports car" --output car.glb
```

### API
```bash
curl -X POST https://your-endpoint.modal.run \
  -H "Content-Type: application/json" \
  -d '{"description": "a robot", "format": "stl"}' \
  --output model.stl
```

## Performance

- **Cold start**: ~10-15s (model loaded from Volume)
- **Warm inference**: ~30-60s per model
- **Without Volume**: ~2-3min cold start (downloading 8GB+ each time)

## Costs

- A100 40GB: ~$3.50/hr
- Volume storage: ~$0.10/GB/month
- Idle containers kept warm for 5min
