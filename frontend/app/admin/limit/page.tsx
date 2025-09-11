"use client";

import React, { ChangeEvent, useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner"; // Use Sonner toast instead
import { useAnchor } from "@/lib/anchor-context";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";

export default function AdminPage() {
  const wallet = useWallet();
  const [updateWallet, setUpdateWallet] = useState("");
  const [backendWallet, setBackendWallet] = useState("");
  const [cptLimit, updateCptLimit] = useState(0);
  const {
    initAdminPanel,
    updateAdminPanel: updateAdminWallet,
    updateBackendWallet: updateBackendWallet,
    setCptLimit: setLimit,
    getAdminWallet,
  } = useAnchor();
  useEffect(() => {
    (async () => {
      const res = await getAdminWallet();
      if (res.success) {
        console.log("Success at fetching admin wallet");
        setUpdateWallet(res.adminWallet);
        setUpdateWallet(res.backendWallet);
        updateCptLimit(res.cptLimit);
      } else {
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  const onChangeAdminWallet = (e: ChangeEvent<HTMLInputElement>) => {
    setUpdateWallet(e.target.value);
  };

  const onChangeBackendWallet = (e: ChangeEvent<HTMLInputElement>) => {
    setBackendWallet(e.target.value);
  };

  const onChangeCptLimit = (e: ChangeEvent<HTMLInputElement>) => {
    updateCptLimit(parseInt(e.target.value));
  };

  const onClickCreateAdminPanel = async () => {
    console.log("Create Btn clicked");
    toast.info("Transaction is pending..");
    const res = await initAdminPanel();
    toast.success(`Transation has been completed! res: ${res}`);
  };

  const updateAdminPanel = async () => {
    console.log("Update Btn clicked", updateWallet);
    toast.info("Transaction is pending..");
    const updateAdminWalletRes = await updateAdminWallet(updateWallet);
    toast.success(
      `Transation has been completed! res: ${updateAdminWalletRes}`,
    );
  };

  const updateBackend = async () => {
    console.log("Update Backend Wallet Btn clicked", backendWallet);
    toast.info("Transaction is pending..");
    const updateBackendWalletRes = await updateBackendWallet(backendWallet);
    toast.success(
      `Transation has been completed! res: ${updateBackendWalletRes}`,
    );
  };

  const setCptLimit = async () => {
    toast.info("Transaction is pending..");
    const setCptLimitRes = await setLimit(cptLimit);
    toast.success(`Transation has been completed! res: ${setCptLimitRes}`);
  };

  return (
    <div className="flex flex-col justify-center items-center mx-auto my-8 p-14 w-4/5 md:w-2/3 lg:w-1/3 gap-3 bg-gray-400 bg-opacity-10 shadow-xl text-3xl">
      {wallet.publicKey?.toBase58() != updateWallet && (
        <span style={{ color: "red", fontSize: "17px" }}>
          &#8855;&nbsp;You are not Admin!!!&nbsp;&#8855;
        </span>
      )}
      <div className="w-full">
        <Label htmlFor="adminWallet" className="text-base font-medium">
          adminWallet:
        </Label>
        <input
          id="adminWallet"
          type="text"
          defaultValue={updateWallet}
          onChange={(e) => onChangeAdminWallet(e)}
          className="flex-1 outline-none border-none placeholder:text-gray-400 min-w-[80px] text-sm"
        />
      </div>
      <div className="w-full">
        <Label htmlFor="backendWallet" className="text-base font-medium">
          backend:
        </Label>
        <input
          id="backendWallet"
          type="text"
          defaultValue={backendWallet}
          onChange={(e) => onChangeBackendWallet(e)}
          className="flex-1 outline-none border-none placeholder:text-gray-400 min-w-[80px] text-sm"
        />
      </div>
      <div className="w-full center">
        <div className="mb-2 block text-white">
          <Label htmlFor="CPTLimit" />
        </div>
        <Label htmlFor="CPTLimit" className="text-base font-medium">
          CPTLimit:
        </Label>
        <input
          id="cptLimit"
          type="number"
          defaultValue={cptLimit}
          onChange={(e) => onChangeCptLimit(e)}
          className="flex-1 outline-none border-none placeholder:text-gray-400 min-w-[80px] text-sm"
        />
      </div>
      <div className="flex flex-row justify-center mt-10 gap-4">
        <Button
          onClick={() => {
            onClickCreateAdminPanel();
          }}
        >
          Create Admin Panel
        </Button>
        <Button onClick={() => updateAdminPanel()}>Update Admin Panel</Button>
        <Button onClick={() => updateBackend()}>Update Backend Wallet</Button>
        <Button onClick={() => setCptLimit()}>Set CPT Limit</Button>
      </div>
    </div>
  );
}
