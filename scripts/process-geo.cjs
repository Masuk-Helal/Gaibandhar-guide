const fs = require("fs");

function decimateRing(ring, tol) {
  if (!Array.isArray(ring) || ring.length < 4) return ring;
  const out = [ring[0]];
  let last = ring[0];
  for (let i = 1; i < ring.length; i++) {
    const p = ring[i];
    if (p && Math.hypot(p[0] - last[0], p[1] - last[1]) >= tol) {
      out.push(p);
      last = p;
    }
  }
  const first = out[0];
  const lastP = out[out.length - 1];
  if (Math.hypot(lastP[0] - first[0], lastP[1] - first[1]) >= 1e-9) {
    out.push([first[0], first[1]]);
  }
  // If too small to be a valid ring, keep the original (already valid)
  if (out.length < 4) return ring;
  return out;
}

function cleanRing(ring) {
  if (!Array.isArray(ring) || ring.length < 4) return null;
  const valid = ring.every(
    (c) =>
      Array.isArray(c) &&
      typeof c[0] === "number" &&
      typeof c[1] === "number" &&
      Number.isFinite(c[0]) &&
      Number.isFinite(c[1])
  );
  if (!valid) return null;
  // ensure closed
  const a = ring[0];
  const b = ring[ring.length - 1];
  if (a[0] !== b[0] || a[1] !== b[1]) ring = [...ring, [a[0], a[1]]];
  return ring.length >= 4 ? ring : null;
}

function cleanGeom(geom, tol) {
  const cleanPoly = (poly) => {
    const rings = (poly || [])
      .map((r) => cleanRing(decimateRing(r, tol)))
      .filter(Boolean);
    return rings.length ? rings : null;
  };

  if (geom.type === "Polygon") {
    const rings = cleanPoly(geom.coordinates);
    return rings ? { type: "Polygon", coordinates: rings } : null;
  }
  if (geom.type === "MultiPolygon") {
    const polys = (geom.coordinates || [])
      .map(cleanPoly)
      .filter(Boolean);
    if (!polys.length) return null;
    if (polys.length === 1) return { type: "Polygon", coordinates: polys[0] };
    return { type: "MultiPolygon", coordinates: polys };
  }
  return null;
}

function processDistricts() {
  const raw = JSON.parse(fs.readFileSync("raw_districts.json", "utf8"));
  const features = [];
  for (const f of raw.features) {
    const p = f.properties;
    const geometry = cleanGeom(f.geometry, 0.004);
    if (!geometry) continue;
    features.push({
      type: "Feature",
      id: p.ADM2_PCODE,
      properties: {
        name: p.ADM2_EN,
        division: p.ADM1_EN,
        divisionCode: p.ADM1_PCODE,
        districtCode: p.ADM2_PCODE,
      },
      geometry,
    });
  }
  fs.writeFileSync(
    "src/data/bangladesh-districts.json",
    JSON.stringify({ type: "FeatureCollection", features })
  );
  const g = features.find((f) => f.id === "BD5532");
  fs.writeFileSync(
    "src/data/gaibandha-district.json",
    JSON.stringify({ type: "FeatureCollection", features: [g] })
  );
  console.log("Districts:", features.length, "| Gaibandha:", g && g.properties.name);
}

function processUpazilas() {
  const raw = JSON.parse(fs.readFileSync("raw_upazilas.json", "utf8"));
  const nameMap = { GaibandhaSadar: "Gaibandha Sadar", Saghatta: "Saghata" };
  const features = [];
  for (const f of raw.features) {
    const p = f.properties;
    if (p.NAME_2 !== "Gaibandha") continue;
    const geometry = cleanGeom(f.geometry, 0.003);
    if (!geometry) continue;
    features.push({
      type: "Feature",
      id: p.GID_3,
      properties: {
        name: nameMap[p.NAME_3] || p.NAME_3,
        district: p.NAME_2,
        division: p.NAME_1,
        upazilaCode: p.GID_3,
        districtCode: p.GID_2,
      },
      geometry,
    });
  }
  const order = [
    "Gaibandha Sadar",
    "Sadullapur",
    "Palashbari",
    "Gobindaganj",
    "Sundarganj",
    "Fulchhari",
    "Saghata",
  ];
  features.sort(
    (a, b) => order.indexOf(a.properties.name) - order.indexOf(b.properties.name)
  );
  fs.writeFileSync(
    "src/data/gaibandha-upazilas.json",
    JSON.stringify({ type: "FeatureCollection", features })
  );
  console.log("Upazilas:", features.length, features.map((f) => f.properties.name).join(", "));
}

processDistricts();
processUpazilas();
