export default function JobCard({
  job,
  repoUrl,
  onRepoUrlChange,
  onSubmit,
  isSubmitting,
  error,
  success,
}) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
        {job.title}
      </div>

      <input
        value={repoUrl}
        onChange={(e) => onRepoUrlChange(job.id, e.target.value)}
        placeholder="https://github.com/tu-usuario/tu-repo"
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={() => onSubmit(job.id)}
        disabled={isSubmitting}
        style={{
          marginTop: 10,
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #ccc",
          cursor: isSubmitting ? "not-allowed" : "pointer",
        }}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>

      {error && (
        <div
          style={{
            marginTop: 10,
            background: "#ffe6e6",
            border: "1px solid #ffb3b3",
            padding: 10,
            borderRadius: 10,
            color: "#111",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginTop: 10,
            background: "#eaffea",
            border: "1px solid #b8f0b8",
            padding: 10,
            borderRadius: 10,
            color: "#111",
          }}
        >
          {success}
        </div>
      )}
    </div>
  );
}