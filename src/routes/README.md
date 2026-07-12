# Rute (Routes)
TanStack Start menggunakan **file-based routing** (penataan rute berbasis file). Setiap file .tsx di dalam direktori ini menentukan sebuah rute. **Jangan** membuat src/pages/, src/routes/_app/index.tsx, atau app/layout.tsx — itu adalah konvensi milik Next.js / Remix. Satu-satunya rute tata letak utama (root layout) adalah src/routes/__root.tsx.
## Konvensi
| File | URL |
|---|---|
| index.tsx | / |
| about.tsx | /about |
| users/index.tsx | /users |
| users/$id.tsx | /users/:id (dinamis — cukup gunakan $, tanpa kurung kurawal) |
| posts/{-$category}.tsx | /posts/:category? (segmen opsional) |
| files/$.tsx | /files/* (splat — dibaca melalui parameter _splat, jangan pernah gunakan *) |
| _layout.tsx | rute tata letak / layout route (menampilkan komponen anak melalui <Outlet/>) |
| __root.tsx | kerangka aplikasi (app shell) — membungkus setiap halaman; pastikan <Outlet/> tetap ada |
routeTree.gen.ts dibuat secara otomatis (auto-generated). Jangan mengubah file tersebut secara manual.
