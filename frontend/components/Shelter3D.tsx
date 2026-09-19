"use client";

import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  Grid,
  OrbitControls,
} from "@react-three/drei";

import * as THREE from "three";

import {
  useEffect,
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
}: Required<Shelter3DProps>) {

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
        material={
          floorMaterial
        }
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
        material={
          wallMaterial
        }
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
        material={
          wallMaterial
        }
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
          material={
            wallMaterial
          }
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
        material={
          glassMaterial
        }
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
        material={
          wallMaterial
        }
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
        material={
          wallMaterial
        }
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
          material={
            wallMaterial
          }
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
        material={
          doorMaterial
        }
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
        material={
          wallMaterial
        }
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
        material={
          wallMaterial
        }
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
        material={
          roofMaterial
        }
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
        material={
          massMaterial
        }
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

  const { camera } =
    useThree();

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


function SunLight() {

  return (
    <>

      <directionalLight
        position={[
          6,
          10,
          -6,
        ]}
        intensity={2.5}
        castShadow
      />

      <mesh
        position={[
          6,
          10,
          -6,
        ]}
      >

        <sphereGeometry
          args={[
            0.4,
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


export default function Shelter3D({
  length = 5,
  width = 4,
  height = 3,
  orientation = 180,
  wallThickness = 0.312,
  roofThickness = 0.22,
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

        <color
          attach="background"
          args={[
            "#020617",
          ]}
        />


        <ambientLight
          intensity={1.2}
        />


        <SunLight />


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


        <CameraController
          length={length}
          width={width}
          height={height}
        />

      </Canvas>

    </div>
  );
}