import express from 'express'
import cors from 'cors'
import axios from 'axios'
import bodyParser from 'body-parser'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

const stylePrompt = {
  default: '-style Realism',
  ghibli: '-style Ghibli Art',
  cyberpunk: '-style Cyberpunk',
  anime: '-style Anime',
  portrait: '-style Portrait',
  chibi: '-style Chibi',
  'pixel art': '-style Pixel Art',
  'oil painting': '-style Oil Painting',
  '3d': '-style 3D'
}

const sizeList = {
  '1:1': '1024x1024',
  '3:2': '1080x720',
  '2:3': '720x1080'
}

app.post('/generate', async (req, res) => {
  const { prompt, style, size } = req.body

  if (!prompt || !stylePrompt[style] || !sizeList[size]) {
    return res.json({ error: 'Input tidak valid!' })
  }

  const headers = {
    'content-type': 'application/json',
    origin: 'https://deepimg.ai',
    referer: 'https://deepimg.ai/'
  }

  const device_id = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  const payload = {
    device_id,
    prompt: `${prompt} ${stylePrompt[style]}`,
    size: sizeList[size],
    n: '1',
    output_format: 'png'
  }

  try {
    const result = await axios.post('https://api-preview.apirouter.ai/api/v1/deepimg/flux-1-dev', payload, { headers })
    const imageUrl = result.data?.data?.images?.[0]?.url

    if (!imageUrl) return res.json({ error: 'Gagal mendapatkan gambar.' })

    res.json({ url: imageUrl })
  } catch (err) {
    res.json({ error: 'Gagal memproses permintaan.' })
  }
})

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`)
})
