"use client";

import { useState } from "react";
import jsPDF from "jspdf";

interface ReportCandidate {
  rank: number;
  orientation_deg: number;
  wall_insulation_thickness_mm: number;
  roof_insulation_thickness_mm: number;
  comfort_percentage: number;
  comfort_hours: number;
  minimum_indoor_temperature_c: number;
  maximum_indoor_temperature_c: number;
  final_indoor_temperature_c: number;
}

interface ReportData {
  projectName: string;

  location: {
    name: string;
    latitude: number;
    longitude: number;
    elevation_m: number | null;
  };

  geometry: {
    length_m: number;
    width_m: number;
    height_m: number;
  };

  orientation_deg: number;

  wall: {
    thickness_mm: number;
    r_value: number;
    u_value: number;
  };

  roof: {
    thickness_mm: number;
    r_value: number;
    u_value: number;
  };

  simulation: {
    final_indoor_temperature_c: number;
    minimum_indoor_temperature_c: number;
    maximum_indoor_temperature_c: number;
    comfort_hours: number;
    cold_hours: number;
    hot_hours: number;
    comfort_percentage: number;
  } | null;

  optimization: {
    total_candidates_tested: number;
    baseline_comfort_percentage: number;
    best_candidate: ReportCandidate;
    candidates: ReportCandidate[];
  } | null;

  baselineDesign: {
    orientation_deg: number;
    wall_insulation_thickness_mm: number;
    roof_insulation_thickness_mm: number;
    comfort_percentage?: number | null;
    minimum_indoor_temperature_c?: number | null;
    maximum_indoor_temperature_c?: number | null;
  } | null;
}

interface ReportButtonProps {
  data: ReportData;
}

function numberText(
  value: number | null | undefined,
  digits = 1,
) {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(digits);
}

function drawHeader(
  doc: jsPDF,
  title: string,
  projectName: string,
) {
  doc.setFillColor(7, 17, 31);
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(projectName, 15, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(title, 15, 21);
}

function drawFooter(
  doc: jsPDF,
  page: number,
) {
  doc.setDrawColor(220, 225, 230);
  doc.line(15, 285, 195, 285);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 130, 140);

  doc.text(
    "Thermo Shelter 1 • Passive Shelter Thermal Analysis",
    15,
    291,
  );

  doc.text(`Page ${page}`, 180, 291);
}

function sectionTitle(
  doc: jsPDF,
  title: string,
  y: number,
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 40, 50);

  doc.text(title, 15, y);

  doc.setDrawColor(190, 198, 205);
  doc.line(15, y + 2, 195, y + 2);

  return y + 10;
}

function field(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(95, 105, 115);
  doc.text(label, x, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 40, 50);
  doc.text(value, x, y + 5);
}

export default function ReportButton({
  data,
}: ReportButtonProps) {
  const [isGenerating, setIsGenerating] =
    useState(false);

  function generateReport() {
    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const generatedAt =
        new Date().toLocaleString();

      /* ==================================================
         PAGE 1
         ================================================== */

      drawHeader(
        doc,
        "Shelter Design & Thermal Analysis",
        data.projectName,
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(110, 120, 130);
      doc.text(
        `Generated: ${generatedAt}`,
        15,
        36,
      );

      let y = 50;

      y = sectionTitle(
        doc,
        "1. Project & Location",
        y,
      );

      field(
        doc,
        "Location",
        data.location.name,
        15,
        y,
      );

      field(
        doc,
        "Coordinates",
        `${data.location.latitude.toFixed(
          4,
        )}, ${data.location.longitude.toFixed(
          4,
        )}`,
        80,
        y,
      );

      field(
        doc,
        "Elevation",
        data.location.elevation_m != null
          ? `${Math.round(
              data.location.elevation_m,
            )} m`
          : "—",
        150,
        y,
      );

      y += 25;

      y = sectionTitle(
        doc,
        "2. Shelter Geometry",
        y,
      );

      field(
        doc,
        "Length",
        `${numberText(
          data.geometry.length_m,
          2,
        )} m`,
        15,
        y,
      );

      field(
        doc,
        "Width",
        `${numberText(
          data.geometry.width_m,
          2,
        )} m`,
        75,
        y,
      );

      field(
        doc,
        "Height",
        `${numberText(
          data.geometry.height_m,
          2,
        )} m`,
        135,
        y,
      );

      y += 22;

      field(
        doc,
        "Orientation",
        `${numberText(
          data.orientation_deg,
          0,
        )}°`,
        15,
        y,
      );

      y += 25;

      y = sectionTitle(
        doc,
        "3. Envelope Performance",
        y,
      );

      doc.setFillColor(245, 248, 250);
      doc.roundedRect(
        15,
        y,
        85,
        43,
        3,
        3,
        "F",
      );

      doc.setFillColor(245, 248, 250);
      doc.roundedRect(
        110,
        y,
        85,
        43,
        3,
        3,
        "F",
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 40, 50);

      doc.text("Wall Assembly", 20, y + 9);
      doc.text("Roof Assembly", 115, y + 9);

      field(
        doc,
        "Thickness",
        `${numberText(
          data.wall.thickness_mm,
          0,
        )} mm`,
        20,
        y + 17,
      );

      field(
        doc,
        "R-value",
        `${numberText(
          data.wall.r_value,
          2,
        )} m²K/W`,
        58,
        y + 17,
      );

      field(
        doc,
        "U-value",
        `${numberText(
          data.wall.u_value,
          3,
        )} W/m²K`,
        20,
        y + 30,
      );

      field(
        doc,
        "Thickness",
        `${numberText(
          data.roof.thickness_mm,
          0,
        )} mm`,
        115,
        y + 17,
      );

      field(
        doc,
        "R-value",
        `${numberText(
          data.roof.r_value,
          2,
        )} m²K/W`,
        153,
        y + 17,
      );

      field(
        doc,
        "U-value",
        `${numberText(
          data.roof.u_value,
          3,
        )} W/m²K`,
        115,
        y + 30,
      );

      y += 58;

      y = sectionTitle(
        doc,
        "4. Thermal Simulation",
        y,
      );

      if (data.simulation) {
        field(
          doc,
          "Final Indoor",
          `${numberText(
            data.simulation
              .final_indoor_temperature_c,
          )} °C`,
          15,
          y,
        );

        field(
          doc,
          "Minimum Indoor",
          `${numberText(
            data.simulation
              .minimum_indoor_temperature_c,
          )} °C`,
          75,
          y,
        );

        field(
          doc,
          "Maximum Indoor",
          `${numberText(
            data.simulation
              .maximum_indoor_temperature_c,
          )} °C`,
          140,
          y,
        );

        y += 25;

        field(
          doc,
          "Comfort",
          `${numberText(
            data.simulation
              .comfort_percentage,
          )}%`,
          15,
          y,
        );

        field(
          doc,
          "Comfort Hours",
          `${numberText(
            data.simulation
              .comfort_hours,
          )} h`,
          75,
          y,
        );

        field(
          doc,
          "Cold Hours",
          `${numberText(
            data.simulation
              .cold_hours,
          )} h`,
          140,
          y,
        );

        y += 22;

        field(
          doc,
          "Hot Hours",
          `${numberText(
            data.simulation
              .hot_hours,
          )} h`,
          15,
          y,
        );
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 130, 140);

        doc.text(
          "Thermal simulation has not been run.",
          15,
          y,
        );
      }

      drawFooter(doc, 1);

      /* ==================================================
         PAGE 2
         ================================================== */

      doc.addPage();

      drawHeader(
        doc,
        "Optimization & Design Comparison",
        data.projectName,
      );

      y = 42;

      y = sectionTitle(
        doc,
        "5. Optimization Search",
        y,
      );

      if (data.optimization) {
        const optimization =
          data.optimization;

        field(
          doc,
          "Candidates Tested",
          String(
            optimization.total_candidates_tested,
          ),
          15,
          y,
        );

        field(
          doc,
          "Baseline Comfort",
          `${numberText(
            optimization.baseline_comfort_percentage,
          )}%`,
          80,
          y,
        );

        field(
          doc,
          "Best Candidate",
          `#${optimization.best_candidate.rank}`,
          150,
          y,
        );

        y += 25;

        y = sectionTitle(
          doc,
          "6. Best Tested Configuration",
          y,
        );

        const best =
          optimization.best_candidate;

        field(
          doc,
          "Orientation",
          `${best.orientation_deg}°`,
          15,
          y,
        );

        field(
          doc,
          "Wall Insulation",
          `${numberText(
            best.wall_insulation_thickness_mm,
            0,
          )} mm`,
          75,
          y,
        );

        field(
          doc,
          "Roof Insulation",
          `${numberText(
            best.roof_insulation_thickness_mm,
            0,
          )} mm`,
          145,
          y,
        );

        y += 24;

        field(
          doc,
          "Comfort",
          `${numberText(
            best.comfort_percentage,
          )}%`,
          15,
          y,
        );

        field(
          doc,
          "Comfort Hours",
          `${numberText(
            best.comfort_hours,
          )} h`,
          75,
          y,
        );

        field(
          doc,
          "Final Indoor",
          `${numberText(
            best.final_indoor_temperature_c,
          )} °C`,
          145,
          y,
        );

        y += 24;

        field(
          doc,
          "Minimum Indoor",
          `${numberText(
            best.minimum_indoor_temperature_c,
          )} °C`,
          15,
          y,
        );

        field(
          doc,
          "Maximum Indoor",
          `${numberText(
            best.maximum_indoor_temperature_c,
          )} °C`,
          75,
          y,
        );

        y += 25;
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 130, 140);

        doc.text(
          "Optimization has not been run.",
          15,
          y,
        );

        y += 20;
      }

      y = sectionTitle(
        doc,
        "7. Baseline vs Optimized",
        y,
      );

      if (
        data.baselineDesign &&
        data.optimization
      ) {
        const baseline =
          data.baselineDesign;

        const best =
          data.optimization.best_candidate;

        doc.setFillColor(245, 248, 250);
        doc.roundedRect(
          15,
          y,
          80,
          55,
          3,
          3,
          "F",
        );

        doc.setFillColor(246, 242, 255);
        doc.roundedRect(
          105,
          y,
          90,
          55,
          3,
          3,
          "F",
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(70, 80, 90);

        doc.text(
          "BASELINE",
          20,
          y + 9,
        );

        doc.setTextColor(110, 70, 170);

        doc.text(
          "OPTIMIZED",
          110,
          y + 9,
        );

        field(
          doc,
          "Orientation",
          `${baseline.orientation_deg}°`,
          20,
          y + 17,
        );

        field(
          doc,
          "Wall Insulation",
          `${numberText(
            baseline.wall_insulation_thickness_mm,
            0,
          )} mm`,
          20,
          y + 30,
        );

        field(
          doc,
          "Roof Insulation",
          `${numberText(
            baseline.roof_insulation_thickness_mm,
            0,
          )} mm`,
          20,
          y + 43,
        );

        field(
          doc,
          "Orientation",
          `${best.orientation_deg}°`,
          110,
          y + 17,
        );

        field(
          doc,
          "Wall Insulation",
          `${numberText(
            best.wall_insulation_thickness_mm,
            0,
          )} mm`,
          110,
          y + 30,
        );

        field(
          doc,
          "Roof Insulation",
          `${numberText(
            best.roof_insulation_thickness_mm,
            0,
          )} mm`,
          110,
          y + 43,
        );

        y += 68;
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 130, 140);

        doc.text(
          "Baseline/optimized comparison is available after optimization.",
          15,
          y,
        );

        y += 18;
      }

      y = sectionTitle(
        doc,
        "8. Top Tested Candidates",
        y,
      );

      if (
        data.optimization &&
        data.optimization.candidates.length > 0
      ) {
        const topCandidates =
          data.optimization.candidates.slice(
            0,
            5,
          );

        doc.setFillColor(235, 240, 244);
        doc.rect(
          15,
          y,
          180,
          9,
          "F",
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(90, 100, 110);

        doc.text("RANK", 17, y + 6);
        doc.text("ORIENT.", 38, y + 6);
        doc.text("WALL", 67, y + 6);
        doc.text("ROOF", 95, y + 6);
        doc.text("COMFORT", 123, y + 6);
        doc.text("HOURS", 158, y + 6);

        y += 9;

        topCandidates.forEach(
          (candidate) => {
            if (candidate.rank === 1) {
              doc.setFillColor(
                248,
                244,
                255,
              );
            } else {
              doc.setFillColor(
                255,
                255,
                255,
              );
            }

            doc.rect(
              15,
              y,
              180,
              9,
              "F",
            );

            doc.setFont(
              "helvetica",
              candidate.rank === 1
                ? "bold"
                : "normal",
            );

            doc.setFontSize(8);
            doc.setTextColor(
              40,
              50,
              60,
            );

            doc.text(
              String(candidate.rank),
              17,
              y + 6,
            );

            doc.text(
              `${candidate.orientation_deg}°`,
              38,
              y + 6,
            );

            doc.text(
              `${candidate.wall_insulation_thickness_mm.toFixed(
                0,
              )} mm`,
              67,
              y + 6,
            );

            doc.text(
              `${candidate.roof_insulation_thickness_mm.toFixed(
                0,
              )} mm`,
              95,
              y + 6,
            );

            doc.text(
              `${candidate.comfort_percentage.toFixed(
                1,
              )}%`,
              123,
              y + 6,
            );

            doc.text(
              `${candidate.comfort_hours.toFixed(
                1,
              )} h`,
              158,
              y + 6,
            );

            y += 9;
          },
        );
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(
          120,
          130,
          140,
        );

        doc.text(
          "No optimization candidates available.",
          15,
          y,
        );
      }

      drawFooter(doc, 2);

      const safeLocation =
        data.location.name
          .replace(
            /[^a-z0-9]+/gi,
            "-",
          )
          .replace(
            /^-+|-+$/g,
            "",
          );

      doc.save(
        `thermo-shelter-report-${
          safeLocation || "analysis"
        }.pdf`,
      );
    } catch (error) {
      console.warn(
        "Report generation notice:",
        error,
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={generateReport}
      disabled={isGenerating}
      className="w-full rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isGenerating
        ? "Generating Report..."
        : "Export Analysis Report"}
    </button>
  );
}