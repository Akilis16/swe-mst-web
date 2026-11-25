export function AuthField({ id, label, error, ...inputProps }) {
  const errorId = `${id}-erro`
  return (
    <div className="conta-campo">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className={error ? 'invalido' : undefined}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error ? (
        <span id={errorId} className="conta-campo-erro">
          {error}
        </span>
      ) : null}
    </div>
  )
}
