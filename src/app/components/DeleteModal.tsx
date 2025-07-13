"use client";

import Modal from "react-modal";
import { text } from "stream/consumers";

type DeleteModalProps = {
  showModal: boolean;
  onOKAction?: () => void;
  onCloseAction: () => void;
};

export default function DeleteModal({showModal, onOKAction, onCloseAction}: DeleteModalProps) {
  return(
    <Modal onRequestClose={onCloseAction} isOpen={showModal}>
      <h1 style={{ color: 'black' }}>Are you sure you want to delete this?</h1>
      <button style={{ color: 'white', backgroundColor: "green" }} onClick={onOKAction}>OK</button>
      <button style={{ color: 'white', backgroundColor: "gray" }} onClick={onCloseAction}>Cancel</button>
    </Modal>      
  )
}