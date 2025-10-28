"use client";

import { useState, FormEvent } from "react";

export default function PostPerson() {
  // --------------------------
  // State variables to hold form inputs
  // --------------------------
  const [name, setName] = useState(""); // Stores the name input from the user
  const [email, setEmail] = useState(""); // Stores the email input from the user
  const [status, setStatus] = useState(""); // Optional: stores feedback message (success/error)

  const [messages, setMessages] = useState([]); // Stores messages fetched from the backend


  const handleFetchMessages = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8000/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messages }),
      });

      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

  // --------------------------
  // Function to handle form submission
  // --------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Prevent the page from refreshing on form submit

    try {
      // Send a POST request to the FastAPI backend
      const response = await fetch("http://127.0.0.1:8000/people", {
        method: "POST", // HTTP method
        headers: { "Content-Type": "application/json" }, // Specify JSON payload
        body: JSON.stringify({ name, email }), // Convert input values to JSON
      });

      if (!response.ok) throw new Error("Failed to add person"); // Throw error if response is not 2xx

      // If successful, update the status message and clear input fields
      setStatus("Person added successfully!");
      setName("");
      setEmail("");
    } catch (err) {
      // Handle errors (network issues, backend errors, duplicate emails, etc.)
      console.error(err);
      setStatus("Error adding person");
    }
  };

  return (
    <div className="p-4">
      {/* Title */}
      <h1 className="text-lg font-bold mb-4">Add a Person</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* Name input */}
        <input
          type="text"
          placeholder="Name"
          value={name} // Controlled input: value comes from state
          onChange={(e) => setName(e.target.value)} // Update state on change
          required // HTML5 validation
          className="border p-2 rounded"
        />

        {/* Email input */}
        <input
          type="email"
          placeholder="Email"
          value={email} // Controlled input
          onChange={(e) => setEmail(e.target.value)} // Update state on change
          required
          className="border p-2 rounded"
        />

        {/* Submit button */}
        <button type="submit" className="bg-violet-600 text-white px-4 py-2 rounded">
          Add Person
        </button>
      </form>

      {/* Feedback message */}
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}
