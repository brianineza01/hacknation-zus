import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"

const f = createUploadthing()

export const ourFileRouter = {
  pdfUploader: f({
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 10,
    },
  })
    .middleware(async ({ req }) => {
      return { userId: "temp-user-id" }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId)
      console.log("file url", file.url)
      console.log("file key", file.key)
      console.log("file name", file.name)
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

