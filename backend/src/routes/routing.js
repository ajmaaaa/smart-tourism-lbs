import express from "express";
import { findNearestNode, calculateRoute } from "../utils/astar.js";

const router = express.Router();
const PORT = process.env.PORT || "5000";
const OSRM_URL =
	process.env.OSRM_URL?.replace(/\/$/, "") || "https://router.project-osrm.org";
const GRAPHOPPER_URL = process.env.GRAPHOPPER_URL?.replace(/\/$/, "");
const GRAPHOPPER_KEY = process.env.GRAPHOPPER_KEY;

function parseCoordinate(value) {
	const num = parseFloat(value);
	return Number.isFinite(num) ? num : null;
}

function isSelfOsrmUrl(url) {
	if (!url) return false;
	return [
		`http://localhost:${PORT}`,
		`http://127.0.0.1:${PORT}`,
		`http://0.0.0.0:${PORT}`,
	].includes(url);
}

function validateCoordinates(fromLat, fromLng, toLat, toLng) {
	return [fromLat, fromLng, toLat, toLng].every((value) =>
		Number.isFinite(value),
	);
}

async function fetchOsrmRoute(fromLat, fromLng, toLat, toLng) {
	if (!OSRM_URL) {
		throw new Error("OSRM_URL not configured");
	}

	const url = `${OSRM_URL}/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?geometries=geojson&overview=full`;
	const response = await fetch(url);
	const data = await response.json();

	if (!response.ok || data.code !== "Ok") {
		throw new Error(data.message || "OSRM request failed");
	}

	const route = data.routes?.[0];
	if (!route) {
		throw new Error("OSRM returned no route");
	}

	return {
		routes: [
			{
				geometry: {
					type: "LineString",
					coordinates: route.geometry.coordinates,
				},
				distance: Math.round(route.distance),
				legs: [
					{
						distance: Math.round(route.distance),
						summary:
							route.legs
								?.map((leg) => leg.summary)
								.filter(Boolean)
								.join(" ") || "",
					},
				],
			},
		],
	};
}

async function fetchGraphhopperRoute(fromLat, fromLng, toLat, toLng) {
	if (!GRAPHOPPER_URL || !GRAPHOPPER_KEY) {
		throw new Error("GraphHopper configuration missing");
	}

	const url = `${GRAPHOPPER_URL}?point=${fromLat},${fromLng}&point=${toLat},${toLng}&profile=car&locale=id&calc_points=true&points_encoded=false&key=${GRAPHOPPER_KEY}`;
	const response = await fetch(url);
	const data = await response.json();

	if (!response.ok || data.info?.errors?.length > 0) {
		throw new Error(
			data.message ||
				data.info?.errors?.[0]?.message ||
				"GraphHopper request failed",
		);
	}

	const path = data.paths?.[0];
	if (!path) {
		throw new Error("GraphHopper returned no route");
	}

	return {
		routes: [
			{
				geometry: {
					type: "LineString",
					coordinates: path.points.coordinates,
				},
				distance: Math.round(path.distance),
				legs: [
					{
						distance: Math.round(path.distance),
						summary:
							path.instructions
								?.map((inst) => inst.text)
								.filter(Boolean)
								.join(" ") || "",
					},
				],
			},
		],
	};
}

router.get("/", async (req, res) => {
	const fromLat = parseCoordinate(req.query.fromLat);
	const fromLng = parseCoordinate(req.query.fromLng);
	const toLat = parseCoordinate(req.query.toLat);
	const toLng = parseCoordinate(req.query.toLng);

	if (!validateCoordinates(fromLat, fromLng, toLat, toLng)) {
		return res
			.status(400)
			.json({ error: "Missing or invalid route query parameters" });
	}

	try {
		if (OSRM_URL && !isSelfOsrmUrl(OSRM_URL)) {
			return res.json(await fetchOsrmRoute(fromLat, fromLng, toLat, toLng));
		}

		if (GRAPHOPPER_URL && GRAPHOPPER_KEY) {
			return res.json(
				await fetchGraphhopperRoute(fromLat, fromLng, toLat, toLng),
			);
		}

		const startNode = findNearestNode({ lat: fromLat, lng: fromLng });
		const endNode = findNearestNode({ lat: toLat, lng: toLng });

		if (!startNode || !endNode) {
			return res
				.status(404)
				.json({ error: "Tidak dapat menemukan node rute terdekat" });
		}

		const route = calculateRoute(startNode.id, endNode.id);
		if (!route) {
			return res.status(404).json({ error: "Rute tidak ditemukan" });
		}

		return res.json({
			routes: [
				{
					geometry: {
						type: "LineString",
						coordinates: route.coordinates.map(([lat, lng]) => [lng, lat]),
					},
					distance: route.distance,
					legs: [
						{
							distance: route.distance,
							summary: route.nodeNames.join(" → "),
						},
					],
				},
			],
		});
	} catch (error) {
		console.error("Routing error:", error.message || error);
		return res
			.status(502)
			.json({ error: error.message || "Routing engine error" });
	}
});

export default router;
