import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import net from "net";
import axios from "axios";
import path from "path";
import fs from "fs";
import { fromPath } from "pdf2pic";

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

const PORT = 5001;
const TCP_PORT = 9100;
const LABELARY_API_URL =
  "http://api.labelary.com/v1/printers/8dpmm/labels/4x6/";

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.text({ type: "*/*" }));

async function renderZpl(
  zplData: string,
  socketServer: SocketIOServer
): Promise<void> {
  if (!zplData || !zplData.trim()) {
    throw new Error("Erro: Nenhum dado ZPL recebido.");
  }

  const response = await axios.post(LABELARY_API_URL, zplData, {
    headers: { Accept: "application/pdf" },
    responseType: "arraybuffer",
  });

  const tempPdfPath = path.join(__dirname, `temp_label_${Date.now()}.pdf`);
  fs.writeFileSync(tempPdfPath, response.data);

  try {
    const options = {
      density: 300,
      saveFilename: "etiqueta",
      savePath: __dirname,
      format: "png",
      width: 600,
      height: 900,
    };
    const convert = fromPath(tempPdfPath, options);

    const resolvedImagePaths = await convert.bulk(-1, {
      responseType: "base64",
    });

    if (!resolvedImagePaths || resolvedImagePaths.length === 0) {
      throw new Error("A conversão do PDF para imagem falhou.");
    }

    const imagesBase64 = resolvedImagePaths.map((img) => img.base64);
    socketServer.emit("new_labels", { image_data_array: imagesBase64 });
  } finally {
    if (fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
    }
  }
}

app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.post("/pstprnt", async (req: Request, res: Response) => {
  const zplData: string = req.body;

  console.log("================ ZPL Recebido ================");
  console.log(zplData);
  console.log("==============================================");

  if (!zplData || !zplData.trim()) {
    return res.status(400).send("Erro: Nenhum dado ZPL recebido.");
  }

  try {
    await renderZpl(zplData, io);
    return res.status(200).send();
  } catch (error) {
    let errorMessage = "Erro desconhecido ao renderizar a etiqueta.";
    let errorDetails = "";

    if (axios.isAxiosError(error)) {
      console.error("Erro ao chamar a API do Labelary:", error.message);
      errorMessage = `Erro ao contatar a API de renderização: ${error.message}`;
      errorDetails = error.response?.data
        ? Buffer.from(error.response.data).toString()
        : "N/A";
      console.error("Detalhes do erro da API:", errorDetails);
    } else {
      console.error("Erro inesperado:", error);
      if (error instanceof Error) {
        errorMessage = error.message;
      }
    }

    io.emit("render_error", { error: errorMessage, details: errorDetails });

    return res.status(502).send(errorMessage);
  }
});

io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

const tcpServer = net.createServer((socket) => {
  const chunks: Buffer[] = [];

  socket.on("data", (data) => {
    chunks.push(data);
  });

  socket.on("end", async () => {
    const zplData = Buffer.concat(chunks).toString("utf8");

    if (!zplData.trim()) {
      console.log("Conexão TCP encerrada sem ZPL.");
      return;
    }

    try {
      console.log("================ ZPL Recebido (TCP) ================");
      console.log(zplData);
      console.log("====================================================");
      await renderZpl(zplData, io);
    } catch (error) {
      let errorMessage = "Erro desconhecido ao renderizar a etiqueta.";
      let errorDetails = "";

      if (axios.isAxiosError(error)) {
        errorMessage = `Erro ao contatar a API de renderização: ${error.message}`;
        errorDetails = error.response?.data
          ? Buffer.from(error.response.data).toString()
          : "N/A";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      io.emit("render_error", { error: errorMessage, details: errorDetails });
      console.error("Erro ao processar ZPL via TCP:", error);
    }
  });

  socket.on("error", (err) => {
    console.error("Erro na conexão TCP:", err);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor Zebra iniciado em http://localhost:${PORT}`);
});

tcpServer.listen(TCP_PORT, () => {
  console.log(`Servidor TCP Zebra ouvindo em 0.0.0.0:${TCP_PORT}`);
});
