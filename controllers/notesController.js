const Note = require("../models/Note")
const User = require("../models/User")
const asyncHandler = require("express-async-handler")

const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().lean()
  if (!notes?.length) {
    res.status(400).json({ message: "No notes found" })
  }
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec()
      return { ...note, username: user?.username }
    })
  )
  res.json(notesWithUser)
})

const createNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body

  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" })
  }

  const usr = await User.findById(user).lean().exec()
  if (!usr) {
    return res.status(400).json({ message: "Invalid user Id" })
  }

  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec()
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate note title" })
  }

  const note = await Note.create({ user, title, text })
  if (note) {
    return res
      .status(201)
      .json({ message: `New note created for user ${usr.username}` })
  } else {
    return res.status(400).json({ message: "Invalid note data received" })
  }
})

const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body
  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fileds are required" })
  }

  const usr = await User.findById(user).lean().exec()
  if (!usr) {
    return res.status(400).json({ message: "Invalid user Id" })
  }
  const note = await Note.findById(id).exec()
  if (!note) {
    return res.status(400).json({ message: "No note exist with this id" })
  }

  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec()
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: `Duplicate title '${title}' found` })
  }

  note.user = user
  note.title = title
  note.text = text
  note.completed = completed
  const updatedNote = await note.save()
  if (updatedNote) {
    return res.status(201).json({ message: `Note with title ${title} updated` })
  } else {
    return res.status(400).json({ message: "Invalid data received" })
  }
})

const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body
  if (!id) {
    return res.status(400).json({ message: "Id is required" })
  }
  const note = await Note.findById(id).exec()
  if (!note) {
    return res.status(400).json({ message: "No note found" })
  }
  await note.deleteOne()
  res
    .status(201)
    .json({ message: `Note ${id} with title '${note.title}'deleted` })
})

module.exports = {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
}
