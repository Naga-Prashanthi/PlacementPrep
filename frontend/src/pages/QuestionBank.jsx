import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getUser, authHeaders, API } from "../utils/auth";

const COMPANIES = ["Amazon","Google","Microsoft","Infosys","TCS","Cognizant","Accenture","Wipro","Capgemini"];
const CATEGORIES = ["DSA","SQL","Aptitude","Technical Interview","HR Interview"];
const DIFFICULTIES = ["Easy","Medium","Hard"];
const FREQUENCIES = ["High","Medium","Low"];

const tagColor = (val, map) => map[val] || "#6b7280";
const diffColors = { Easy: "#10b981", Medium: "#f59e0b", Hard: "#ef4444" };
const freqColors = { High: "#8b5cf6", Medium: "#3b82f6", Low: "#6b7280" };

export default function QuestionBank() {
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const [questions,   setQuestions]   = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [analytics,   setAnalytics]   = useState(null);
  const [filter,  setFilter]  = useState({ company: "", category: "", difficulty: "", search: "" });
  const [tab,     setTab]     = useState("browse"); // browse | submit | analytics | manage (admin)
  const [editingQ, setEditingQ] = useState(null);
  const [form, setForm] = useState({ title:"", company:"Amazon", category:"DSA", description:"", difficulty:"Medium", frequency:"Medium", topic:"", yearAsked:"", source:"" });
  const [subForm, setSubForm] = useState({ title:"", company:"Amazon", category:"DSA", description:"", difficulty:"Medium", yearAsked: new Date().getFullYear(), roundType:"", notes:"" });
  const [msg, setMsg] = useState("");

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const loadQuestions = async () => {
    const params = new URLSearchParams();
    if (filter.company)    params.append("company",    filter.company);
    if (filter.category)   params.append("category",   filter.category);
    if (filter.difficulty) params.append("difficulty", filter.difficulty);
    if (filter.search)     params.append("search",     filter.search);
    const res = await fetch(`${API}/api/questions?${params}`, { headers: authHeaders() });
    setQuestions(await res.json());
  };

  const loadSubmissions = async () => {
    if (!isAdmin) return;
    const res = await fetch(`${API}/api/admin/submissions`, { headers: authHeaders() });
    setSubmissions(await res.json());
  };

  const loadAnalytics = async () => {
    const res = await fetch(`${API}/api/questions/analytics`, { headers: authHeaders() });
    setAnalytics(await res.json());
  };

  useEffect(() => { loadQuestions(); }, [filter]);
  useEffect(() => {
    loadSubmissions();
    loadAnalytics();
  }, []);

  const handleAddQuestion = async () => {
    if (!form.title) return flash("❌ Title required.");
    const res = await fetch(`${API}/api/admin/questions`, {
      method: "POST", headers: authHeaders(), body: JSON.stringify(form)
    });
    if (res.ok) { flash("✅ Question added!"); setForm({ ...form, title:"", description:"" }); loadQuestions(); }
    else flash("❌ Failed to add question.");
  };

  const handleEditQuestion = async () => {
    if (!editingQ?._id) return;
    const res = await fetch(`${API}/api/admin/questions/${editingQ._id}`, {
      method: "PUT", headers: authHeaders(), body: JSON.stringify(editingQ)
    });
    if (res.ok) { flash("✅ Question updated!"); setEditingQ(null); loadQuestions(); }
    else flash("❌ Update failed.");
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    await fetch(`${API}/api/admin/questions/${id}`, { method: "DELETE", headers: authHeaders() });
    loadQuestions();
  };

  const handleModerateSubmission = async (id, action) => {
    const res = await fetch(`${API}/api/admin/submissions/${id}`, {
      method: "PUT", headers: authHeaders(), body: JSON.stringify({ action })
    });
    if (res.ok) { flash(`✅ Submission ${action}d!`); loadSubmissions(); loadQuestions(); }
  };

  const handleStudentSubmit = async () => {
    if (!subForm.title) return flash("❌ Question title required.");
    const res = await fetch(`${API}/api/student/submit-question`, {
      method: "POST", headers: authHeaders(), body: JSON.stringify(subForm)
    });
    if (res.ok) { flash("✅ Question submitted for review!"); setSubForm({ ...subForm, title:"", description:"", notes:"" }); }
    else flash("❌ Submission failed.");
  };

  const S = { // styles
    page: { display:"flex", minHeight:"100vh", background:"#f8fafc" },
    content: { flex:1, padding:"28px", overflowY:"auto" },
    card: { background:"#fff", borderRadius:"12px", padding:"20px", boxShadow:"0 2px 8px rgba(0,0,0,0.07)", marginBottom:"16px" },
    badge: (color) => ({ background: color + "20", color, padding:"2px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:"600" }),
    btn: (color="#2563eb") => ({ background:color, color:"#fff", border:"none", borderRadius:"8px", padding:"8px 18px", cursor:"pointer", fontWeight:"600", fontSize:"13px" }),
    input: { padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:"8px", fontSize:"14px", width:"100%" },
    select: { padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:"8px", fontSize:"14px", background:"#fff" },
    tabBtn: (active) => ({ padding:"8px 20px", borderRadius:"20px", border:"none", cursor:"pointer", fontWeight:"600", fontSize:"13px", background: active?"#2563eb":"#e2e8f0", color: active?"#fff":"#374151" }),
    label: { fontSize:"12px", color:"#64748b", display:"block", marginBottom:"4px", fontWeight:"500" },
  };

  const tabs = isAdmin ? ["browse","submit","analytics","manage","submissions"] : ["browse","submit","analytics"];

  return (
    <>
      <Navbar />
      <div style={S.page}>
        <Sidebar />
        <div style={S.content}>
          <h1 style={{ margin:"0 0 6px", fontSize:"24px" }}>📚 Question Intelligence Bank</h1>
          <p style={{ color:"#64748b", marginBottom:"20px" }}>Real company interview questions — curated, contributed, and continuously growing.</p>

          {msg && <div style={{ background: msg.startsWith("✅")?"#dcfce7":"#fee2e2", color: msg.startsWith("✅")?"#166534":"#991b1b", padding:"10px 16px", borderRadius:"8px", marginBottom:"16px", fontWeight:"600" }}>{msg}</div>}

          {/* Tabs */}
          <div style={{ display:"flex", gap:"8px", marginBottom:"24px", flexWrap:"wrap" }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={S.tabBtn(tab === t)}>
                {{ browse:"🔍 Browse", submit:"📝 Submit Question", analytics:"📊 Analytics", manage:"⚙️ Manage Questions", submissions:"🗂️ Pending Submissions" }[t]}
              </button>
            ))}
          </div>

          {/* ── BROWSE TAB ── */}
          {tab === "browse" && (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"12px", marginBottom:"20px" }}>
                <div>
                  <label style={S.label}>Company</label>
                  <select style={S.select} value={filter.company} onChange={e => setFilter({...filter, company:e.target.value})}>
                    <option value="">All Companies</option>
                    {COMPANIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Category</label>
                  <select style={S.select} value={filter.category} onChange={e => setFilter({...filter, category:e.target.value})}>
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Difficulty</label>
                  <select style={S.select} value={filter.difficulty} onChange={e => setFilter({...filter, difficulty:e.target.value})}>
                    <option value="">Any Difficulty</option>
                    {DIFFICULTIES.map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Search</label>
                  <input style={S.input} placeholder="Search questions..." value={filter.search} onChange={e => setFilter({...filter, search:e.target.value})} />
                </div>
              </div>

              <p style={{ color:"#64748b", marginBottom:"12px", fontSize:"14px" }}>{questions.length} questions found</p>

              {questions.map(q => (
                <div key={q._id} style={{ ...S.card, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"16px" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"8px" }}>
                      <span style={S.badge(diffColors[q.difficulty] || "#6b7280")}>{q.difficulty}</span>
                      <span style={S.badge("#2563eb")}>{q.category}</span>
                      <span style={S.badge("#374151")}>{q.company}</span>
                      {q.frequency && <span style={S.badge(freqColors[q.frequency])}>{q.frequency} Frequency</span>}
                      {q.yearAsked && <span style={S.badge("#0ea5e9")}>{q.yearAsked}</span>}
                    </div>
                    <h3 style={{ margin:"0 0 6px", fontSize:"16px" }}>{q.title}</h3>
                    {q.description && <p style={{ margin:0, color:"#64748b", fontSize:"13px" }}>{q.description}</p>}
                    {q.topic && <p style={{ margin:"4px 0 0", fontSize:"12px", color:"#94a3b8" }}>Topic: {q.topic}</p>}
                  </div>
                  {isAdmin && (
                    <div style={{ display:"flex", gap:"8px", flexShrink:0 }}>
                      <button style={S.btn("#f59e0b")} onClick={() => setEditingQ({...q})}>Edit</button>
                      <button style={S.btn("#ef4444")} onClick={() => handleDeleteQuestion(q._id)}>Delete</button>
                    </div>
                  )}
                </div>
              ))}

              {questions.length === 0 && (
                <div style={{ textAlign:"center", padding:"60px", color:"#94a3b8" }}>
                  <div style={{ fontSize:"48px" }}>🔍</div>
                  <p>No questions found. Try adjusting filters or seed the database.</p>
                </div>
              )}
            </>
          )}

          {/* ── SUBMIT TAB ── */}
          {tab === "submit" && (
            <div style={{ maxWidth:"600px" }}>
              <div style={S.card}>
                <h2 style={{ margin:"0 0 16px" }}>📝 {isAdmin ? 'Add Question' : 'Submit Interview Question'}</h2>
                {!isAdmin && <p style={{ color:"#64748b", marginBottom:"16px", fontSize:"14px" }}>Encountered a question in an interview? Share it with the community — it'll be reviewed by our admin before going live.</p>}

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  <div style={{ gridColumn:"1/-1" }}>
                    <label style={S.label}>Question Title *</label>
                    <input style={S.input} placeholder="e.g. Find the Kth largest element" value={isAdmin ? form.title : subForm.title}
                      onChange={e => isAdmin ? setForm({...form,title:e.target.value}) : setSubForm({...subForm,title:e.target.value})} />
                  </div>
                  <div>
                    <label style={S.label}>Company</label>
                    <select style={S.select} value={isAdmin ? form.company : subForm.company}
                      onChange={e => isAdmin ? setForm({...form,company:e.target.value}) : setSubForm({...subForm,company:e.target.value})}>
                      {COMPANIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Category</label>
                    <select style={S.select} value={isAdmin ? form.category : subForm.category}
                      onChange={e => isAdmin ? setForm({...form,category:e.target.value}) : setSubForm({...subForm,category:e.target.value})}>
                      {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Difficulty</label>
                    <select style={S.select} value={isAdmin ? form.difficulty : subForm.difficulty}
                      onChange={e => isAdmin ? setForm({...form,difficulty:e.target.value}) : setSubForm({...subForm,difficulty:e.target.value})}>
                      {DIFFICULTIES.map(d=><option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Year Asked</label>
                    <input style={S.input} type="number" placeholder="2024" value={isAdmin ? form.yearAsked : subForm.yearAsked}
                      onChange={e => isAdmin ? setForm({...form,yearAsked:e.target.value}) : setSubForm({...subForm,yearAsked:e.target.value})} />
                  </div>
                  {isAdmin && <>
                    <div>
                      <label style={S.label}>Frequency</label>
                      <select style={S.select} value={form.frequency} onChange={e => setForm({...form,frequency:e.target.value})}>
                        {FREQUENCIES.map(f=><option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Topic</label>
                      <input style={S.input} placeholder="e.g. Arrays, Joins" value={form.topic} onChange={e => setForm({...form,topic:e.target.value})} />
                    </div>
                    <div>
                      <label style={S.label}>Source</label>
                      <input style={S.input} placeholder="e.g. LeetCode, HackerRank" value={form.source} onChange={e => setForm({...form,source:e.target.value})} />
                    </div>
                  </>}
                  {!isAdmin && (
                    <div>
                      <label style={S.label}>Round Type</label>
                      <input style={S.input} placeholder="e.g. Online Test, Technical Round 1" value={subForm.roundType}
                        onChange={e => setSubForm({...subForm,roundType:e.target.value})} />
                    </div>
                  )}
                  <div style={{ gridColumn:"1/-1" }}>
                    <label style={S.label}>Description / Details</label>
                    <textarea style={{ ...S.input, minHeight:"80px" }} placeholder="Optional: full question text, constraints, etc."
                      value={isAdmin ? form.description : subForm.description}
                      onChange={e => isAdmin ? setForm({...form,description:e.target.value}) : setSubForm({...subForm,description:e.target.value})} />
                  </div>
                  {!isAdmin && (
                    <div style={{ gridColumn:"1/-1" }}>
                      <label style={S.label}>Additional Notes</label>
                      <textarea style={{ ...S.input, minHeight:"60px" }} placeholder="Any context about the interview round, experience, etc."
                        value={subForm.notes} onChange={e => setSubForm({...subForm,notes:e.target.value})} />
                    </div>
                  )}
                </div>

                <button style={{ ...S.btn(), marginTop:"16px" }} onClick={isAdmin ? handleAddQuestion : handleStudentSubmit}>
                  {isAdmin ? "➕ Add to Bank" : "📤 Submit for Review"}
                </button>
              </div>
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {tab === "analytics" && analytics && (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>
                <div style={S.card}>
                  <h3 style={{ margin:"0 0 14px" }}>🏆 Most Reported Questions</h3>
                  {analytics.trending.map((q,i) => (
                    <div key={q._id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f1f5f9" }}>
                      <span style={{ fontSize:"13px" }}><strong>{i+1}.</strong> {q.title} <span style={{ color:"#94a3b8" }}>({q.company})</span></span>
                      <span style={{ fontSize:"12px", color:"#8b5cf6", fontWeight:"600" }}>⭐ {q.reportCount || 0}</span>
                    </div>
                  ))}
                  {analytics.trending.length === 0 && <p style={{ color:"#94a3b8", fontSize:"13px" }}>No data yet.</p>}
                </div>

                <div style={S.card}>
                  <h3 style={{ margin:"0 0 14px" }}>🏢 Questions by Company</h3>
                  {analytics.byCompany.map(c => (
                    <div key={c._id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #f1f5f9" }}>
                      <span style={{ fontSize:"13px", fontWeight:"600" }}>{c._id}</span>
                      <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                        <div style={{ width:`${Math.min(c.count*3,100)}px`, height:"6px", background:"#2563eb", borderRadius:"3px" }} />
                        <span style={{ fontSize:"12px", color:"#64748b" }}>{c.count}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={S.card}>
                  <h3 style={{ margin:"0 0 14px" }}>📚 Questions by Category</h3>
                  {analytics.byCategory.map(c => (
                    <div key={c._id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #f1f5f9" }}>
                      <span style={{ fontSize:"13px", fontWeight:"600" }}>{c._id}</span>
                      <span style={{ ...S.badge("#2563eb"), fontSize:"13px" }}>{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ADMIN MANAGE TAB ── */}
          {tab === "manage" && isAdmin && editingQ && (
            <div style={{ maxWidth:"600px" }}>
              <div style={S.card}>
                <h2 style={{ margin:"0 0 16px" }}>✏️ Edit Question</h2>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  <div style={{ gridColumn:"1/-1" }}>
                    <label style={S.label}>Title</label>
                    <input style={S.input} value={editingQ.title} onChange={e => setEditingQ({...editingQ,title:e.target.value})} />
                  </div>
                  <div><label style={S.label}>Company</label>
                    <select style={S.select} value={editingQ.company} onChange={e => setEditingQ({...editingQ,company:e.target.value})}>
                      {COMPANIES.map(c=><option key={c}>{c}</option>)}
                    </select></div>
                  <div><label style={S.label}>Category</label>
                    <select style={S.select} value={editingQ.category} onChange={e => setEditingQ({...editingQ,category:e.target.value})}>
                      {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                    </select></div>
                  <div><label style={S.label}>Difficulty</label>
                    <select style={S.select} value={editingQ.difficulty} onChange={e => setEditingQ({...editingQ,difficulty:e.target.value})}>
                      {DIFFICULTIES.map(d=><option key={d}>{d}</option>)}
                    </select></div>
                  <div><label style={S.label}>Frequency</label>
                    <select style={S.select} value={editingQ.frequency} onChange={e => setEditingQ({...editingQ,frequency:e.target.value})}>
                      {FREQUENCIES.map(f=><option key={f}>{f}</option>)}
                    </select></div>
                  <div style={{ gridColumn:"1/-1" }}>
                    <label style={S.label}>Description</label>
                    <textarea style={{ ...S.input, minHeight:"80px" }} value={editingQ.description}
                      onChange={e => setEditingQ({...editingQ,description:e.target.value})} />
                  </div>
                </div>
                <div style={{ display:"flex", gap:"10px", marginTop:"16px" }}>
                  <button style={S.btn()} onClick={handleEditQuestion}>💾 Save Changes</button>
                  <button style={S.btn("#6b7280")} onClick={() => setEditingQ(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          {tab === "manage" && isAdmin && !editingQ && (
            <p style={{ color:"#64748b" }}>Select a question from the Browse tab to edit it.</p>
          )}

          {/* ── SUBMISSIONS TAB ── */}
          {tab === "submissions" && isAdmin && (
            <div>
              <h2 style={{ margin:"0 0 16px" }}>🗂️ Pending Student Submissions ({submissions.length})</h2>
              {submissions.length === 0 && <div style={{ ...S.card, textAlign:"center", color:"#94a3b8" }}><p>No pending submissions.</p></div>}
              {submissions.map(q => (
                <div key={q._id} style={{ ...S.card }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:"8px", marginBottom:"8px", flexWrap:"wrap" }}>
                        <span style={S.badge(diffColors[q.difficulty])}>{q.difficulty}</span>
                        <span style={S.badge("#2563eb")}>{q.category}</span>
                        <span style={S.badge("#374151")}>{q.company}</span>
                        <span style={S.badge("#f59e0b")}>⏳ Pending</span>
                      </div>
                      <h3 style={{ margin:"0 0 4px" }}>{q.title}</h3>
                      {q.description && <p style={{ margin:"0 0 4px", fontSize:"13px", color:"#64748b" }}>{q.description}</p>}
                      {q.notes && <p style={{ margin:"0 0 4px", fontSize:"12px", color:"#94a3b8" }}>Notes: {q.notes}</p>}
                      {q.createdBy && <p style={{ margin:0, fontSize:"12px", color:"#94a3b8" }}>Submitted by: <strong>{q.createdBy.name}</strong> ({q.createdBy.email})</p>}
                    </div>
                    <div style={{ display:"flex", gap:"8px", flexShrink:0, marginLeft:"12px" }}>
                      <button style={S.btn("#10b981")} onClick={() => handleModerateSubmission(q._id,"approve")}>✅ Approve</button>
                      <button style={S.btn("#ef4444")} onClick={() => handleModerateSubmission(q._id,"reject")}>❌ Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal backdrop */}
      {editingQ && tab !== "manage" && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={() => setEditingQ(null)}>
          <div style={{ background:"#fff", borderRadius:"12px", padding:"28px", width:"500px", maxWidth:"95vw" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin:"0 0 16px" }}>✏️ Edit Question</h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={S.label}>Title</label>
                <input style={S.input} value={editingQ.title} onChange={e => setEditingQ({...editingQ,title:e.target.value})} />
              </div>
              <div><label style={S.label}>Difficulty</label>
                <select style={S.select} value={editingQ.difficulty} onChange={e => setEditingQ({...editingQ,difficulty:e.target.value})}>
                  {DIFFICULTIES.map(d=><option key={d}>{d}</option>)}
                </select></div>
              <div><label style={S.label}>Frequency</label>
                <select style={S.select} value={editingQ.frequency} onChange={e => setEditingQ({...editingQ,frequency:e.target.value})}>
                  {FREQUENCIES.map(f=><option key={f}>{f}</option>)}
                </select></div>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={S.label}>Description</label>
                <textarea style={{ ...S.input, minHeight:"70px" }} value={editingQ.description}
                  onChange={e => setEditingQ({...editingQ,description:e.target.value})} />
              </div>
            </div>
            <div style={{ display:"flex", gap:"10px", marginTop:"16px" }}>
              <button style={S.btn()} onClick={handleEditQuestion}>💾 Save</button>
              <button style={S.btn("#6b7280")} onClick={() => setEditingQ(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
