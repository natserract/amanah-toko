import { useMemo } from 'react';

import Modal from '../modal/Modal';
import { ActionsProps } from './index';

// TODO - add other actions (print, export (csv, pdf))
export default function Actions({
  checked,
  title,
  handleDestroy,
}: ActionsProps) {
  const rows = useMemo(() => {
    return Object.keys(checked).filter((id) => checked[id]).length;
  }, [checked]);

  return (
    <>
      {rows > 0 && (
        <div className="mt-3">
          <span className="me-2">
            {rows} {title.toLowerCase()} dipilih. Aksi:
          </span>
          <button
            type="button"
            className="ml-3 btn btn-danger rounded-0"
            data-bs-toggle="modal"
            data-bs-target="#deleteChecked"
          >
            Hapus
          </button>
          <Modal
            id="deleteChecked"
            label="deleteCheckedLabel"
            title={`Delete ${title}`}
            body={`<b>Apakah Anda yakin ingin menghapus ${rows} ${title.toLowerCase()}?</b>. Aksi ini tidak bisa di undo.`}
            handleAction={handleDestroy}
          />
        </div>
      )}
    </>
  );
}
