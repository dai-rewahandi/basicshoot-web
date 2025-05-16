import sharp from "sharp";
import satori from "satori";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file || !file.type.startsWith("image/")) {
        return new Response("Invalid image", { status: 400 });
    }

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
                    background: "linear-gradient(to bottom right, #fef3c7, #fcd34d)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "24px",
                },
                children: {
                    type: "img",
                    props: {
                        src: `data:${file.type};base64,${buffer.toString("base64")}`,
                        style: {
                            width: "80%",
                            borderRadius: "16px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                        },
                    },
                },
            },
        },
        {
            width: newWidth,
            height: newHeight,
            fonts: [], // Tambahkan font jika perlu
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
