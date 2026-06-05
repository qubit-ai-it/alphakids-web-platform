export default function LeadForm() {
  return (
    <section id="lead-form" className="bg-secondary-50 py-[80px] md:py-[100px]">
      <div className="mx-auto max-w-[600px] px-[24px]">
        <div className="card text-center py-[60px]">
          <span className="material-symbols-outlined mb-[16px] text-[56px] text-primary-500">
            auto_stories
          </span>
          <h2 className="mb-[24px] text-[28px] font-bold text-secondary-900 md:text-[32px]">
            ¿Querés saber más?
          </h2>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScRLZDjEsbL4XhpmIWaMkipRqVUCpNymgM8djBV9O08ynNScg/viewform?usp=publish-editor"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-fluid inline-flex items-center justify-center gap-[8px]"
          >
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
            Ir al formulario
          </a>
        </div>
      </div>
    </section>
  );
}
