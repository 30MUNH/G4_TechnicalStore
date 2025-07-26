import React, { useEffect, useState } from "react";
import { accountService } from "../services/accountService";
import { useNavigate } from "react-router-dom";

const UserDetailsPage = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await accountService.getAccountDetails();
        console.log("Response:", res);
        const userData = res.data?.data || res.data;
        if (res.success && userData) {
          setUser(userData);
          setForm({ ...userData });
        } else {
          setError(res.message || "Failed to load user details");
        }
      } catch (err) {
        setError("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await accountService.updateAccount(user?.username, form);
      if (res.success && res.data) {
        setUser(res.data);
        setEditMode(false);
        setSuccess("Account updated successfully!");
      } else {
        setError(res.message || "Failed to update account");
      }
    } catch (err) {
      setError("Failed to update account");
    }
  };

  if (loading)
    return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  if (error)
    return (
      <div style={{ padding: 40, color: "red", textAlign: "center" }}>
        {error}
      </div>
    );

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        padding: 32,
      }}
    >
      <h2 style={{ textAlign: "center", color: "#1e3c72", marginBottom: 24 }}>
        Account Details
      </h2>
      {success && (
        <div style={{ color: "green", marginBottom: 16, textAlign: "center" }}>
          {success}
        </div>
      )}
      {!editMode ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <b>Username:</b> {user?.username || ""}
          </div>
          <div style={{ marginBottom: 16 }}>
            <b>Phone:</b> {user?.phone || ""}
          </div>
          <div style={{ marginBottom: 16 }}>
            <b>Role:</b> {user?.role?.name || ""}
          </div>
          <button
            style={{
              marginTop: 16,
              padding: "8px 24px",
              borderRadius: 6,
              background: "#1e3c72",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => setEditMode(true)}
          >
            Edit
          </button>
          <button
            style={{
              marginLeft: 12,
              marginTop: 16,
              padding: "8px 24px",
              borderRadius: 6,
              background: "#eee",
              color: "#1e3c72",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </>
      ) : (
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600 }}>Phone</label>
            <input
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc",
                marginTop: 4,
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600 }}>Password</label>
            <input
              name="password"
              type="password"
              value={form.password || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc",
                marginTop: 4,
              }}
              placeholder="Leave blank to keep current password"
            />
          </div>
          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: "8px 24px",
              borderRadius: 6,
              background: "#1e3c72",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Save
          </button>
          <button
            type="button"
            style={{
              marginLeft: 12,
              marginTop: 8,
              padding: "8px 24px",
              borderRadius: 6,
              background: "#eee",
              color: "#1e3c72",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => setEditMode(false)}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default UserDetailsPage;
