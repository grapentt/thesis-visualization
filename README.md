# Diffusion Geometry Video

Animations and visual explanations built to help me visualize my master thesis.

The thesis is about **score-based generative models on curved spaces**. The idea is
to generate molecular structures by first adding noise to them step by step and then
learning to reverse that noising process. Molecules have no preferred position or
orientation in space, so the natural home for their shapes is a curved *shape space*
rather than ordinary flat coordinates. Doing diffusion there means working with
geometry directly: metrics, geodesics, the exponential map and Brownian motion on a
manifold.

These ideas are much easier to see than to read. This repository collects the
animations I use to build intuition, check my own understanding and explain the work
to others.

## What this will show

- **Flat vs. curved diffusion:** how noise spreads in ordinary space compared with on
  a curved surface, and why the shape of the space changes the result.
- **Shape space:** how removing translation, rotation and scale turns a point cloud of
  atoms into a single point on a manifold.
- **Geodesics and the exponential map:** the curved-space version of a straight line,
  and how a step along a tangent direction lands back on the manifold.
- **Forward noising and reverse generation:** a molecule dissolving into noise, and the
  learned score field guiding it back to a realistic structure.
- **Where it gets hard:** nearly flat (almost planar) configurations, where the
  geometry becomes badly conditioned and numerical integration struggles.

## Status

Early stage. Scenes, rendering setup and exported videos will be added as the
storyboard takes shape.

## Layout (planned)

```
scenes/    animation source, one file per topic
assets/    small static inputs (figures, example structures)
media/     rendered output (ignored by git)
```

Rendered videos and large intermediate files stay out of git; only source and small
assets are versioned.
