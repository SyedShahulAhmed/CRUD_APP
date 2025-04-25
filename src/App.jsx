import React, { useState } from "react";
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [inputText, setInputText] = useState("");
  const [dataList, setDataList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [viewed, setViewed] = useState(false);

  const textsCollection = collection(db, "texts");

  const handleSubmit = async () => {
    if (inputText.trim() === "") return;

    try {
      const docRef = await addDoc(textsCollection, {
        text: inputText,
        timestamp: new Date(),
      });
      setDataList([{ id: docRef.id, text: inputText, timestamp: new Date() }, ...dataList]);
      setInputText("");
      toast.success("Record added successfully!");
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to add record.");
    }
  };

  const handleViewData = async () => {
    try {
      const snapshot = await getDocs(textsCollection);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sorted = items.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      setDataList(sorted);
      setViewed(true);
    } catch (error) {
      console.error("Error retrieving data:", error);
      toast.error("Failed to load records.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "texts", id));
      setDataList((prev) => prev.filter((item) => item.id !== id));
      toast.success("Record deleted.");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete record.");
    }
  };

  const startEditing = (id, currentText) => {
    setEditId(id);
    setEditText(currentText);
  };

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, "texts", editId);
      await updateDoc(docRef, { text: editText });
      setDataList((prev) =>
        prev.map((item) => (item.id === editId ? { ...item, text: editText } : item))
      );
      setEditId(null);
      setEditText("");
      toast.success("Record updated successfully!");
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update record.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-3xl font-bold text-center mb-6">🚀 Firebase CRUD App</h1>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6 flex-wrap">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter something..."
          className="p-3 text-lg border border-gray-300 rounded-md w-full sm:w-96"
        />
        <button
          onClick={handleSubmit}
          disabled={!inputText.trim()}
          className={`px-6 py-3 text-white rounded-md ${
            inputText.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Add
        </button>
        <button
          onClick={handleViewData}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          View Records
        </button>
      </div>

      {viewed ? (
        dataList.length > 0 ? (
          <ul className="space-y-4 max-w-2xl mx-auto">
            {dataList.map((item) => (
              <li
                key={item.id}
                className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row sm:items-center sm:justify-between"
              >
                {editId === item.id ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="p-2 border border-gray-300 rounded-md flex-1"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="text-lg font-medium">{item.text}</span>
                      <span className="text-sm text-gray-500">
                        {item.timestamp?.seconds
                          ? new Date(item.timestamp.seconds * 1000).toLocaleString()
                          : "No timestamp"}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3 sm:mt-0">
                      <button
                        onClick={() => startEditing(item.id, item.text)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600 text-lg">No records found.</p>
        )
      ) : (
        <p className="text-center text-gray-600 text-lg">Click "View Records" to see data.</p>
      )}
    </div>
  );
}

export default App;
