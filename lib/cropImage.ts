export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<File | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  // Calculate bounding box of the rotated image
  const bBoxWidth = image.width
  const bBoxHeight = image.height

  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-image.width / 2, -image.height / 2)

  // Draw image to canvas
  ctx.drawImage(image, 0, 0)

  // Extract the cropped image data from the canvas
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  )

  // Resize canvas to final crop size
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // Put cropped image data back on canvas
  ctx.putImageData(data, 0, 0)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null)
        return
      }
      const file = new File([blob], 'cropped_logo.webp', { type: 'image/webp' })
      resolve(file)
    }, 'image/webp', 0.9)
  })
}
