# ReRoute — Dynamic Fleet & Delivery Replanning

ReRoute is a browser-based dispatch workspace for assigning deliveries to vehicles and replanning routes when the day changes. It uses a local, simulated travel-time matrix; it does not call a live mapping or GPS service.

## Live demo

https://darshnanavati28.github.io/reroute-dynamic-fleet/

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

## What it includes

- Vehicle assignments constrained by capacity and delivery time windows.
- Arrival, waiting, service-start, and post-stop load details.
- Simulated road closures, vehicle failures, and urgent deliveries.
- Plain-language disruption reports, shown for dispatcher confirmation before they are applied. Unknown locations are rejected.
- Replanning that keeps completed stops fixed and excludes failed vehicles from new assignments after failure.
- Original and revised route comparison, with kept, moved, and broken deliveries and reasons.
- JSON plan export.

## Planning approach

The planner uses a deterministic greedy heuristic. It processes deliveries in earliest-deadline-first order, with urgent jobs breaking ties. For each delivery, it checks the available vehicles and chooses the feasible option with the lowest incremental travel, waiting, service, and small route-length cost. It rejects assignments that would exceed capacity or miss the delivery window. Unplaced deliveries remain visible with a reason.

This approach is simple to explain and fast to recalculate, but it does not guarantee a globally shortest or optimal plan. It uses a simulated symmetric travel matrix and assumes fixed service times, a single depot, no pickup loads, and replanning at a reported failure checkpoint. It does not model a failure occurring mid-leg.

## Deploy

GitHub Actions builds the Vite app and publishes `dist/` to GitHub Pages when changes are pushed to `main`.
