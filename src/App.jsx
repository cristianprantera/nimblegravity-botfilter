import { useEffect, useState } from "react";
import { apiGet, apiPost } from "./api";
import JobCard from "./components/JobCard";

export default function App() {
  // Jobs (Step 3)
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");

  // Candidate (Step 2)
  const [email, setEmail] = useState("");
  const [candidate, setCandidate] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateError, setCandidateError] = useState("");

  // Repo URL por jobId
  const [repoUrlByJobId, setRepoUrlByJobId] = useState({});

  // Estado de submit por jobId
  const [submitStateByJobId, setSubmitStateByJobId] = useState({});

  // Al iniciar: cargar jobs
  useEffect(() => {
    (async () => {
      try {
        setJobsLoading(true);
        setJobsError("");
        const list = await apiGet("/api/jobs/get-list");
        setJobs(list || []);
      } catch (e) {
        setJobsError(e.message || "Error cargando posiciones");
      } finally {
        setJobsLoading(false);
      }
    })();
  }, []);

  async function fetchCandidate() {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setCandidateError("Ingresá tu email.");
      return;
    }

    try {
      setCandidateLoading(true);
      setCandidateError("");
      const data = await apiGet(
        `/api/candidate/get-by-email?email=${encodeURIComponent(cleanEmail)}`
      );
      setCandidate(data);
    } catch (e) {
      setCandidate(null);
      setCandidateError(e.message || "Error obteniendo candidato");
    } finally {
      setCandidateLoading(false);
    }
  }

  function onRepoUrlChange(jobId, value) {
    setRepoUrlByJobId((prev) => ({ ...prev, [jobId]: value }));
  }

  function patchSubmitState(jobId, patch) {
    setSubmitStateByJobId((prev) => ({
      ...prev,
      [jobId]: { ...(prev[jobId] || {}), ...patch },
    }));
  }

  async function submit(jobId) {
    patchSubmitState(jobId, { error: "", success: "" });

    if (!candidate?.uuid || !candidate?.candidateId) {
      patchSubmitState(jobId, {
        error: "Primero buscá tu candidato por email (Step 2).",
      });
      return;
    }

    const repoUrl = (repoUrlByJobId[jobId] || "").trim();
    if (!repoUrl) {
      patchSubmitState(jobId, { error: "Ingresá la URL del repo." });
      return;
    }

    try {
      patchSubmitState(jobId, { loading: true });

      // Step 5 body EXACTO
      const body = {
        uuid: candidate.uuid,
        jobId: jobId,
        candidateId: candidate.candidateId,
        repoUrl: repoUrl,
      };

      const res = await apiPost("/api/candidate/apply-to-job", body);

      if (res?.ok === true) {
        patchSubmitState(jobId, { success: "✅ { ok: true }" });
      } else {
        patchSubmitState(jobId, { success: "✅ Enviado correctamente" });
      }

      console.log("Apply response:", res);
    } catch (e) {
      patchSubmitState(jobId, { error: e.message || "Error enviando postulación" });
    } finally {
      patchSubmitState(jobId, { loading: false });
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1>Nimble Gravity — Bot Filter Challenge</h1>

      <p style={{ opacity: 0.85, marginTop: 6 }}>
        1) Buscá tu candidato por email. 2) Pegá la URL del repo en la posición
        deseada. 3) Presioná Submit.
      </p>

      {/* Step 2 */}
      <section style={{ border: "1px solid #eee", padding: 16, borderRadius: 12 }}>
        <h2>Step 2 — Obtener candidato por email</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu.email@ejemplo.com"
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ccc",
            }}
          />
          <button onClick={fetchCandidate} disabled={candidateLoading}>
            {candidateLoading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {candidateError && (
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
            {candidateError}
          </div>
        )}

        {candidate && (
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
            <div>
              <b>uuid:</b> {candidate.uuid}
            </div>
            <div>
              <b>candidateId:</b> {candidate.candidateId}
            </div>
          </div>
        )}
      </section>

      {/* Step 4 */}
      <section
        style={{
          marginTop: 16,
          border: "1px solid #eee",
          padding: 16,
          borderRadius: 12,
        }}
      >
        <h2>Step 4 — Listado de posiciones</h2>

        {jobsLoading && <div>Cargando posiciones...</div>}

        {jobsError && (
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
            {jobsError}
          </div>
        )}

        {!jobsLoading &&
          !jobsError &&
          jobs.map((job) => {
            const st = submitStateByJobId[job.id] || {};
            return (
              <JobCard
                key={job.id}
                job={job}
                repoUrl={repoUrlByJobId[job.id] || ""}
                onRepoUrlChange={onRepoUrlChange}
                onSubmit={submit}
                isSubmitting={Boolean(st.loading)}
                error={st.error}
                success={st.success}
              />
            );
          })}
      </section>
    </div>
  );
}