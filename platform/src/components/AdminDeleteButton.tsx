"use client";

// Botão de exclusão para o admin. Recebe uma server action como prop e pede
// confirmação antes de enviar, evitando exclusões acidentais.
export default function AdminDeleteButton({
  action,
  id,
  confirmMsg,
  label = "Excluir",
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmMsg: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMsg)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs font-medium text-red-600 transition hover:underline"
      >
        {label}
      </button>
    </form>
  );
}
