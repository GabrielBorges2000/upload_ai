import { FileVideo, Upload } from 'lucide-react'
import { Separator } from './ui/separator'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react'
import { getFFmpeg } from '@/lib/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

export function VideoImputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const promptInputRef = useRef<HTMLTextAreaElement>(null)

  const hendleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.currentTarget

    if (!files) {
      return
    }

    const selectedFile = files[0]

    setVideoFile(selectedFile)
  }

  const convertVideoToAudio = async (video: File) => {
    console.log('Convert Started...')

    const ffmpeg = await getFFmpeg()

    await ffmpeg.writeFile('input.mp4', await fetchFile(video))

    // ffmpeg.on('log', (log) => console.log(log.message))

    ffmpeg.on('progress', (progress) => {
      console.log('Convert progress: ' + Math.round(progress.progress * 100))
    })

    ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3',
    ])

    const data = await ffmpeg.readFile('output.mp3')

    const audioFileBlob = new Blob([data], { type: 'audio/mpeg' })

    const audioFile = new File([audioFileBlob], 'output.mp3', {
      type: 'audio/mpeg',
    })

    console.log('Convert Finished!')

    return audioFile
  }

  const handleUploadVideo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const prompt = promptInputRef.current?.value

    if (!videoFile) {
      return
    }

    const audioFile = await convertVideoToAudio(videoFile)

    console.log(audioFile, prompt)
  }

  const previewURL = useMemo(() => {
    if (!videoFile) {
      return null
    }

    return URL.createObjectURL(videoFile)
  }, [videoFile])

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6">
      <label
        htmlFor="video"
        className="relative flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm text-muted-foreground hover:bg-primary/5"
      >
        {previewURL ? (
          <video
            src={previewURL}
            controls={false}
            className="pointer-events-none absolute inset-0"
          />
        ) : (
          <>
            <FileVideo className="h-4 w-4" />
            Selecione um vídeo
          </>
        )}
      </label>
      <input
        type="file"
        id="video"
        accept="video/mp4"
        className="sr-only"
        onChange={hendleFileSelected}
      />

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
        <Textarea
          ref={promptInputRef}
          className="h-20 resize-none leading-relaxed"
          id="transcription_prompt"
          placeholder="Inclua palavras-chaves mencionadas no vídeo separadas por vírgula(,)"
        />
      </div>

      <Button type="submit" className="w-full">
        Carregar vídeo
        <Upload className="ml-2 h-4 w-4" />
      </Button>
    </form>
  )
}
