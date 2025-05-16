import sharp from "sharp";
import satori from "satori";
import fs from "fs/promises";
import path from "path";
import "@fontsource/outfit/600";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const name = formData.get("name");

    const fontPath = path.resolve("node_modules/@fontsource/outfit/files/outfit-latin-400-normal.woff");
    if (!file || !file.type.startsWith("image/")) {
        return new Response("Invalid image", { status: 400 });
    }
    const fontData = await fs.readFile(fontPath);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dapatkan dimensi gambar asli
    const { width, height } = await sharp(buffer).metadata();

    // Tambahkan 100px ke dimensi gambar
    const newWidth = (width || 0) + 100;
    const newHeight = (height || 0) + 100;

    // Generate SVG dengan dimensi baru
    const svg = await satori(
        {
            type: "div",
            props: {
                style: {
                    width: `${newWidth}px`,
                    height: `${newHeight}px`,
                    background:
                        "radial-gradient(circle at 20% 30%, rgba(255, 138, 0, 0.6) 0%, rgba(255, 255, 255, 0.1) 60%),radial-gradient(circle at 80% 40%, rgba(255, 45, 149, 0.5) 0%, rgba(255, 255, 255, 0.1) 60%),radial-gradient(circle at 50% 70%, rgba(106, 130, 251, 0.5) 0%, rgba(255, 255, 255, 0.1) 60%),radial-gradient(circle at 70% 80%, rgba(0, 242, 254, 0.5) 0%, rgba(255, 255, 255, 0.1) 60%),radial-gradient(circle at 30% 80%, rgba(246, 245, 120, 0.6) 0%, rgba(255, 255, 255, 0.1) 60%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "24px",
                    backgroundColor: "#ffffff",
                    backgroundBlendMode: "screen",
                },
                children: [
                    {
                        type: "span",
                        props: {
                            style: {
                                margin: "0 0 3em 0",
                            },
                            children: name,
                        },
                    },

                    {
                        type: "img",
                        props: {
                            src: `data:${file.type};base64,${buffer.toString("base64")}`,
                            style: {
                                width: "80%",
                                border: "solid rgb(65, 65, 65) 2px",
                                borderRadius: "15px",
                                boxShadow: "-4px 4px 10px rgba(0,0,0,0.4),4px 4px 10px rgba(0,0,0,0.4)",
                            },
                        },
                    },
                ],
            },
        },
        {
            width: newWidth,
            height: newHeight,
            fonts: [
                {
                    name: "Outfit",
                    data: fontData,
                    weight: 400,
                    style: "normal",
                },
            ], // Tambahkan font jika perlu
        },
    );

    // Konversi ke PNG menggunakan sharp
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

    return new Response(pngBuffer, {
        headers: {
            "Content-Type": "image/png",
        },
    });
};
