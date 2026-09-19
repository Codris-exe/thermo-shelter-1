"use client";

import {
  Canvas,
  useThree,
} from "@react-three/fiber";

import {
  Grid,
  OrbitControls,
} from "@react-three/drei";

import * as THREE from "three";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import type {
  OrbitControls as OrbitControlsImpl,
} from "three-stdlib";


interface Shelter3DProps {
  length?: number;
  width?: number;
  height?: number;
  orientation?: number;
  wallThickness?: number;
  roofThickness?: number;

  /*
   * Climate inputs are visualization inputs only.
   * The thermal engine remains the source of simulation results.
   */
  outdoorTemperatureC?: number | null;
  solarIrradianceWm2?: number;
  windSpeedMs?: number;
  isDay?: boolean;

  /*
   * Hour-of-day used to animate the visual sun path.
   * This is a visualization control, not a replacement
   * for the physical solar-position model.
   */
  climateHour?: number;

  /*
   * Geographic and seasonal inputs used by the solar-position model.
   * The default values represent the initial Ladakh/Leh demo location.
   */
  latitude?: number;
  longitude?: number;
  climateMonth?: number | null;
  timezoneOffsetHours?: number;
}


const wallMaterial = new THREE.MeshStandardMaterial({
  color: "#a16207",
  roughness: 0.85,
});

const roofMaterial = new THREE.MeshStandardMaterial({
  color: "#64748b",
  roughness: 0.8,
});

const floorMaterial = new THREE.MeshStandardMaterial({
  color: "#475569",
  roughness: 0.9,
});

const glassMaterial = new THREE.MeshStandardMaterial({
  color: "#38bdf8",
  transparent: true,
  opacity: 0.65,
  roughness: 0.15,
  metalness: 0.1,
});

const doorMaterial = new THREE.MeshStandardMaterial({
  color: "#334155",
  roughness: 0.8,
});

const massMaterial = new THREE.MeshStandardMaterial({
  color: "#78716c",
  roughness: 0.95,
});


function ShelterModel({
  length,
  width,
  height,
  orientation,
  wallThickness,
  roofThickness,
}: Required<
  Pick<
    Shelter3DProps,
    | "length"
    | "width"
    | "height"
    | "orientation"
    | "wallThickness"
    | "roofThickness"
  >
>) {
  const windowWidth = 1.5;
  const windowHeight = 1.2;
  const windowBottom = 1.5;

  const doorWidth = 0.9;
  const doorHeight = 2.1;

  const leftWallWidth =
    (length - windowWidth) / 2;

  const doorSideWidth =
    (length - doorWidth) / 2;

  const topWindowHeight =
    Math.max(
      height -
        (windowBottom + windowHeight),
      0,
    );

  const topDoorHeight =
    Math.max(
      height - doorHeight,
      0,
    );

  return (
    <group
      rotation={[
        0,
        THREE.MathUtils.degToRad(
          orientation - 180,
        ),
        0,
      ]}
    >
      {/* FLOOR */}
      <mesh
        position={[
          0,
          -0.1,
          0,
        ]}
        material={floorMaterial}
        receiveShadow
      >
        <boxGeometry
          args={[
            length,
            0.2,
            width,
          ]}
        />
      </mesh>

      {/* SOUTH WALL LEFT */}
      <mesh
        position={[
          -(
            windowWidth / 2 +
            leftWallWidth / 2
          ),
          height / 2,
          -width / 2,
        ]}
        material={wallMaterial}
        castShadow
      >
        <boxGeometry
          args={[
            leftWallWidth,
            height,
            wallThickness,
          ]}
        />
      </mesh>

      {/* SOUTH WALL RIGHT */}
      <mesh
        position={[
          windowWidth / 2 +
            leftWallWidth / 2,
          height / 2,
          -width / 2,
        ]}
        material={wallMaterial}
        castShadow
      >
        <boxGeometry
          args={[
            leftWallWidth,
            height,
            wallThickness,
          ]}
        />
      </mesh>

      {/* SOUTH WALL ABOVE WINDOW */}
      {topWindowHeight > 0 && (
        <mesh
          position={[
            0,
            windowBottom +
              windowHeight +
              topWindowHeight / 2,
            -width / 2,
          ]}
          material={wallMaterial}
          castShadow
        >
          <boxGeometry
            args={[
              windowWidth,
              topWindowHeight,
              wallThickness,
            ]}
          />
        </mesh>
      )}

      {/* SOUTH WINDOW */}
      <mesh
        position={[
          0,
          windowBottom +
            windowHeight / 2,
          -width / 2 -
            wallThickness / 2 -
            0.03,
        ]}
        material={glassMaterial}
      >
        <boxGeometry
          args={[
            windowWidth,
            windowHeight,
            0.05,
          ]}
        />
      </mesh>

      {/* NORTH WALL LEFT */}
      <mesh
        position={[
          -(
            doorWidth / 2 +
            doorSideWidth / 2
          ),
          height / 2,
          width / 2,
        ]}
        material={wallMaterial}
        castShadow
      >
        <boxGeometry
          args={[
            doorSideWidth,
            height,
            wallThickness,
          ]}
        />
      </mesh>

      {/* NORTH WALL RIGHT */}
      <mesh
        position={[
          doorWidth / 2 +
            doorSideWidth / 2,
          height / 2,
          width / 2,
        ]}
        material={wallMaterial}
        castShadow
      >
        <boxGeometry
          args={[
            doorSideWidth,
            height,
            wallThickness,
          ]}
        />
      </mesh>

      {/* NORTH WALL ABOVE DOOR */}
      {topDoorHeight > 0 && (
        <mesh
          position={[
            0,
            doorHeight +
              topDoorHeight / 2,
            width / 2,
          ]}
          material={wallMaterial}
          castShadow
        >
          <boxGeometry
            args={[
              doorWidth,
              topDoorHeight,
              wallThickness,
            ]}
          />
        </mesh>
      )}

      {/* DOOR */}
      <mesh
        position={[
          0,
          doorHeight / 2,
          width / 2 -
            wallThickness / 2 -
            0.03,
        ]}
        material={doorMaterial}
      >
        <boxGeometry
          args={[
            doorWidth,
            doorHeight,
            0.06,
          ]}
        />
      </mesh>

      {/* EAST WALL */}
      <mesh
        position={[
          length / 2,
          height / 2,
          0,
        ]}
        material={wallMaterial}
        castShadow
      >
        <boxGeometry
          args={[
            wallThickness,
            height,
            width,
          ]}
        />
      </mesh>

      {/* WEST WALL */}
      <mesh
        position={[
          -length / 2,
          height / 2,
          0,
        ]}
        material={wallMaterial}
        castShadow
      >
        <boxGeometry
          args={[
            wallThickness,
            height,
            width,
          ]}
        />
      </mesh>

      {/* ROOF */}
      <mesh
        position={[
          0,
          height +
            roofThickness / 2,
          0,
        ]}
        material={roofMaterial}
        castShadow
      >
        <boxGeometry
          args={[
            length +
              wallThickness,
            roofThickness,
            width +
              wallThickness,
          ]}
        />
      </mesh>

      {/* THERMAL MASS */}
      <mesh
        position={[
          0,
          0.55,
          0,
        ]}
        material={massMaterial}
        castShadow
      >
        <boxGeometry
          args={[
            1.2,
            1.1,
            0.8,
          ]}
        />
      </mesh>
    </group>
  );
}


function CameraController({
  length,
  width,
  height,
}: {
  length: number;
  width: number;
  height: number;
}) {
  const { camera } = useThree();

  const controlsRef =
    useRef<OrbitControlsImpl | null>(
      null,
    );

  useEffect(() => {
    const largestDimension =
      Math.max(
        length,
        width,
        height,
      );

    const distance =
      largestDimension * 2.3;

    camera.position.set(
      distance,
      distance * 0.65,
      distance,
    );

    camera.lookAt(
      0,
      height / 2,
      0,
    );

    if (controlsRef.current) {
      controlsRef.current.target.set(
        0,
        height / 2,
        0,
      );

      controlsRef.current.update();
    }

    camera.updateProjectionMatrix();
  }, [
    camera,
    length,
    width,
    height,
  ]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={3}
      maxDistance={50}
      target={[
        0,
        height / 2,
        0,
      ]}
    />
  );
}


function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value: number) {
  return (value * 180) / Math.PI;
}

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function dayOfYearForMonth(month: number | null | undefined) {
  const safeMonth = Math.min(
    12,
    Math.max(1, Math.round(month ?? 6)),
  );

  // Representative mid-month date. For an annual profile,
  // June 21 is used as a neutral high-solar reference day.
  const day = month == null ? 21 : 15;
  const date = new Date(
    Date.UTC(2025, safeMonth - 1, day),
  );

  const start = new Date(Date.UTC(2025, 0, 1));
  return (
    Math.floor(
      (date.getTime() - start.getTime()) / 86400000,
    ) + 1
  );
}

interface SolarPosition {
  elevationDeg: number;
  azimuthDeg: number;
  isAboveHorizon: boolean;
}

function calculateSolarPosition({
  latitude,
  longitude,
  climateHour,
  climateMonth,
  timezoneOffsetHours,
}: {
  latitude: number;
  longitude: number;
  climateHour: number;
  climateMonth: number | null | undefined;
  timezoneOffsetHours: number;
}): SolarPosition {
  const safeLatitude = THREE.MathUtils.clamp(
    latitude,
    -89.9,
    89.9,
  );

  const n = dayOfYearForMonth(climateMonth);
  const gamma =
    (2 * Math.PI * (n - 1)) / 365;

  const equationOfTimeMinutes =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  const declinationRad =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  // Convert local clock time into local solar time using the
  // longitude correction and equation of time.
  const standardMeridian =
    15 * timezoneOffsetHours;

  const timeCorrectionMinutes =
    4 * (longitude - standardMeridian) +
    equationOfTimeMinutes;

  const solarTimeHours =
    climateHour +
    timeCorrectionMinutes / 60;

  let hourAngleDeg =
    15 * (solarTimeHours - 12);

  while (hourAngleDeg > 180) {
    hourAngleDeg -= 360;
  }

  while (hourAngleDeg < -180) {
    hourAngleDeg += 360;
  }

  const latitudeRad = degreesToRadians(
    safeLatitude,
  );

  const hourAngleRad = degreesToRadians(
    hourAngleDeg,
  );

  const cosZenith = THREE.MathUtils.clamp(
    Math.sin(latitudeRad) *
        Math.sin(declinationRad) +
      Math.cos(latitudeRad) *
        Math.cos(declinationRad) *
        Math.cos(hourAngleRad),
    -1,
    1,
  );

  const zenithRad = Math.acos(cosZenith);
  const elevationDeg =
    90 - radiansToDegrees(zenithRad);

  // Solar azimuth measured clockwise from true north.
  const azimuthRad = Math.atan2(
    Math.sin(hourAngleRad),
    Math.cos(hourAngleRad) *
        Math.sin(latitudeRad) -
      Math.tan(declinationRad) *
        Math.cos(latitudeRad),
  );

  const azimuthDeg = normalizeDegrees(
    radiansToDegrees(azimuthRad) + 180,
  );

  return {
    elevationDeg,
    azimuthDeg,
    isAboveHorizon: elevationDeg > 0,
  };
}

function ClimateSun({
  solarIrradianceWm2,
  isDay,
  climateHour,
  latitude,
  longitude,
  climateMonth,
  timezoneOffsetHours,
}: {
  solarIrradianceWm2: number;
  isDay: boolean;
  climateHour: number;
  latitude: number;
  longitude: number;
  climateMonth: number | null | undefined;
  timezoneOffsetHours: number;
}) {
  const lightRef =
    useRef<THREE.DirectionalLight | null>(
      null,
    );

  const sunMeshRef =
    useRef<THREE.Mesh | null>(
      null,
    );

  const solarPosition = useMemo(
    () =>
      calculateSolarPosition({
        latitude,
        longitude,
        climateHour,
        climateMonth,
        timezoneOffsetHours,
      }),
    [
      latitude,
      longitude,
      climateHour,
      climateMonth,
      timezoneOffsetHours,
    ],
  );

  const visualSolarFactor =
    THREE.MathUtils.clamp(
      solarIrradianceWm2 / 800,
      0,
      1,
    );

  const solarElevationRad = degreesToRadians(
    Math.max(0, solarPosition.elevationDeg),
  );

  const horizontalRadius = 10;

  // Coordinate convention for the shelter scene:
  // north = +Z, south = -Z, east = +X, west = -X.
  // Therefore azimuth 180° (south) maps to z = -radius.
  const azimuthRad = degreesToRadians(
    solarPosition.azimuthDeg,
  );

  const sunX =
    Math.sin(azimuthRad) * horizontalRadius;

  const sunZ =
    -Math.cos(azimuthRad) * horizontalRadius;

  const sunY =
    1.5 +
    Math.sin(solarElevationRad) *
      (5.5 + visualSolarFactor * 4.5);

  const visible =
    isDay &&
    solarPosition.isAboveHorizon &&
    solarIrradianceWm2 > 5;

  const targetIntensity = visible
    ? 0.45 + visualSolarFactor * 2.35
    : 0.08;

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.intensity =
        targetIntensity;

      lightRef.current.position.set(
        sunX,
        Math.max(1.5, sunY),
        sunZ,
      );
    }

    if (sunMeshRef.current) {
      sunMeshRef.current.visible = visible;

      sunMeshRef.current.position.set(
        sunX,
        Math.max(1.5, sunY),
        sunZ,
      );
    }
  }, [
    targetIntensity,
    sunX,
    sunY,
    sunZ,
    visible,
  ]);

  return (
    <>
      <directionalLight
        ref={lightRef}
        position={[
          sunX,
          Math.max(1.5, sunY),
          sunZ,
        ]}
        intensity={targetIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <mesh
        ref={sunMeshRef}
        visible={visible}
        position={[
          sunX,
          Math.max(1.5, sunY),
          sunZ,
        ]}
      >
        <sphereGeometry
          args={[
            0.4 +
              visualSolarFactor * 0.2,
            24,
            24,
          ]}
        />

        <meshBasicMaterial
          color="#facc15"
        />
      </mesh>
    </>
  );
}

function ClimateAtmosphere({
  outdoorTemperatureC,
  solarIrradianceWm2,
  windSpeedMs,
  isDay,
}: {
  outdoorTemperatureC: number | null;
  solarIrradianceWm2: number;
  windSpeedMs: number;
  isDay: boolean;
}) {
  const {
    scene,
  } = useThree();

  const normalizedTemperature =
    outdoorTemperatureC === null
      ? 0.5
      : THREE.MathUtils.clamp(
          (outdoorTemperatureC + 20) /
            60,
          0,
          1,
        );

  const daytimeBrightness =
    THREE.MathUtils.clamp(
      solarIrradianceWm2 / 800,
      0,
      1,
    );

  /*
   * Background changes are purely visual indicators
   * of the environmental state.
   */
  const background = useMemo(() => {
    if (!isDay) {
      return new THREE.Color(
        "#020617",
      );
    }

    if (normalizedTemperature < 0.35) {
      return new THREE.Color(
        "#0f2742",
      );
    }

    if (normalizedTemperature > 0.7) {
      return new THREE.Color(
        "#3a2615",
      );
    }

    return new THREE.Color(
      "#12243a",
    );
  }, [
    isDay,
    normalizedTemperature,
  ]);

  useEffect(() => {
    scene.background = background;

    return () => {
      scene.background = null;
    };
  }, [
    scene,
    background,
  ]);

  /*
   * Keep this component tied to wind so the 3D scene
   * will visually respond further when wind indicators
   * are added without changing the current model.
   */
  void windSpeedMs;
  void daytimeBrightness;

  return null;
}


function ClimateOverlay({
  outdoorTemperatureC,
  solarIrradianceWm2,
  windSpeedMs,
  isDay,
}: {
  outdoorTemperatureC: number | null;
  solarIrradianceWm2: number;
  windSpeedMs: number;
  isDay: boolean;
}) {
  return (
    <group>
      <sprite
        position={[
          0,
          4,
          0,
        ]}
      >
        <spriteMaterial
          transparent
          opacity={0}
        />
      </sprite>

      {isDay && solarIrradianceWm2 > 5 && (
        <pointLight
          position={[
            2,
            5,
            -2,
          ]}
          intensity={Math.min(
            1.2,
            solarIrradianceWm2 /
              650,
          )}
          distance={12}
        />
      )}

      {outdoorTemperatureC !== null && (
        <mesh
          position={[
            0,
            -0.08,
            0,
          ]}
        >
          <ringGeometry
            args={[
              3.1,
              3.14,
              48,
            ]}
          />

          <meshBasicMaterial
            color={
              outdoorTemperatureC <= 0
                ? "#38bdf8"
                : outdoorTemperatureC >= 25
                  ? "#fb923c"
                  : "#22c55e"
            }
            transparent
            opacity={0.14}
          />
        </mesh>
      )}
    </group>
  );
}


export default function Shelter3D({
  length = 5,
  width = 4,
  height = 3,
  orientation = 180,
  wallThickness = 0.312,
  roofThickness = 0.22,
  outdoorTemperatureC = null,
  solarIrradianceWm2 = 0,
  windSpeedMs = 0,
  isDay = true,
  climateHour = 12,
  latitude = 34.1650,
  longitude = 77.5840,
  climateMonth = 1,
  timezoneOffsetHours = 5.5,
}: Shelter3DProps) {
  return (
    <div className="h-full min-h-[520px] w-full overflow-hidden rounded-xl bg-slate-950">
      <Canvas
        shadows
        camera={{
          position: [
            9,
            6,
            9,
          ],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
        }}
      >
        <ClimateAtmosphere
          outdoorTemperatureC={
            outdoorTemperatureC
          }
          solarIrradianceWm2={
            solarIrradianceWm2
          }
          windSpeedMs={windSpeedMs}
          isDay={isDay}
        />

        <ambientLight
          intensity={
            isDay
              ? 0.55
              : 0.3
        }
      />

        <ClimateSun
          solarIrradianceWm2={
            solarIrradianceWm2
          }
          isDay={isDay}
          climateHour={climateHour}
          latitude={latitude}
          longitude={longitude}
          climateMonth={climateMonth}
          timezoneOffsetHours={timezoneOffsetHours}
        />

        <Grid
          args={[
            30,
            30,
          ]}
          cellSize={1}
          cellThickness={0.6}
          cellColor="#334155"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#64748b"
          fadeDistance={30}
          fadeStrength={1}
        />

        <ShelterModel
          length={length}
          width={width}
          height={height}
          orientation={
            orientation
          }
          wallThickness={
            wallThickness
          }
          roofThickness={
            roofThickness
          }
        />

        <ClimateOverlay
          outdoorTemperatureC={
            outdoorTemperatureC
          }
          solarIrradianceWm2={
            solarIrradianceWm2
          }
          windSpeedMs={windSpeedMs}
          isDay={isDay}
        />

        <CameraController
          length={length}
          width={width}
          height={height}
        />
      </Canvas>
    </div>
  );
}
