"use client";

import { useState } from "react";
import Modal from "react-modal";

type AddModalProps = {
    showModal: boolean;
    onOKAction?: (name: string) => void;
    onCloseAction: () => void;
};

export default function AddItemModal({ showModal, onOKAction, onCloseAction }: AddModalProps) {
    const [itemName, setItemName] = useState("");

    const handleAdd = () => {
        if (onOKAction) {
            onOKAction(itemName.trim());
        }
    };

    return (
        <Modal onRequestClose={onCloseAction} isOpen={showModal} ariaHideApp={false}>
            <h1 style={{ color: 'black' }}>Add a new item?</h1>
            <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Enter item name"
                style={{ padding: 8, margin: "10px 0", width: "100%" }}
            />
            <button style={{ color: 'white', backgroundColor: "green" }} onClick={handleAdd} disabled={!itemName.trim()}>Add</button>
            <button style={{ color: 'white', backgroundColor: "gray" }} onClick={onCloseAction}>Cancel</button>
        </Modal>
    )
}