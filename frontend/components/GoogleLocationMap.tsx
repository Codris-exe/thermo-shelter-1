"use client";

import OpenStreetLocationMap from "./OpenStreetLocationMap";

interface Props {
  latitude: number;
  longitude: number;
  zoom?: number;
}

export default function GoogleLocationMap(props: Props) {
  return <OpenStreetLocationMap {...props} />;
}
