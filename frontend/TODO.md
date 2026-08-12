# Smart Order Router — Frontend Dashboard

## Plan Steps
- [x] 1. Analyze project structure & data sources
- [x] 2. Extract token/routers/routes data into frontend data module
- [x] 3. Create `frontend/index.html` (dashboard shell)
- [x] 4. Create `frontend/css/style.css` (professional dark theme)
- [x] 5. Create `frontend/js/data.js` (embedded cached data)
- [x] 6. Create `frontend/js/app.js` (rendering & logic)
- [x] 7. Create `server.js` (serve frontend + run automation scripts)
- [x] 8. Optimize pipeline speed (discover made optional; batch size 20)
- [x] 9. Add dynamic WETH amount input flowing through pipeline
- [x] 10. Switch RPC from hardcoded localhost to configured mainnet RPC
- [x] 11. Fix fake "profitable" best route — now reads real backend result
- [x] 12. Fix routes table — no more fake profits on every row
- [x] 13. Execute swap uses only the real verified best route
- [x] 14. Test / verify

## Follow-up
- Run `node server.js`
- Open http://localhost:3000
- Set WETH amount → Run Scan / Run Best Route Only / Run Pipeline (fast)
- Routes table shows candidates as UNVERIFIED (—) — only the real best route is marked
- Click "Discover Pools (slow)" only when a fresh pool scan is needed
</content>
