console.log("Fetching user info...");
  const response = await axios.post("/api/users/get-user-info", {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  console.log("User info response:", response.data);