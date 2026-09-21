const Loading = () => {
  return (
    <section className="app-loading" role="status" aria-live="polite">
      <div className="app-loading__spinner" />
      <p>Loading InvoiceFlow...</p>
    </section>
  );
};

export default Loading;