import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0f2d52 0%, #0e9494 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 20,
          fontWeight: 800,
          fontFamily: "sans-serif",
          paddingBottom: 1,
        }}
      >
        K
      </div>
    ),
    { ...size }
  );
}
