---
title: 'The Geometry of LLM Context Windows'
description: 'Exploring the spatial metaphors we use to understand attention mechanisms and why the "infinite" window is a design fallacy.'
pubDate: 2026-04-23
category: 'System Design'
tags: ['llm', 'ai', 'architecture']
draft: false
locale: 'en'
readingTime: 12
---

When we talk about a model's *context*, we tend to reach for the metaphor of a window — something framed, rectangular, a measure of how much of the world can be held at once. But the window is the wrong geometry. Attention is not a pane; it is a field.

The field is dense near the edges we've just touched and sparse in the middle distance. Doubling the window size does not double the clarity; it doubles the haze. A longer context without a sharper prior is not more memory — it is more fog.

What we want instead is a *mental topography* — a shape to the context that encodes not just what has been said, but where it sits in the reader's intent. Position is meaning, and the first token is not the first thought but the first gesture.
