/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { getCurrentUserRole } from "@/utils/auth/getCurrentUserRole";
import BetaTesterPayoutModal from "@/components/BetaTesterPayoutModal";
import {
  fetchFlaggedSubmissions,
  fetchBugReports,
  fetchBetaTesterRequests,
} from "@/lib/supabase/adminFetchers";
import { Button } from "@/components/ui/button";
import RemoveBugModal from "@/components/RemoveBugReportModal";
import { logError } from "@/lib/supabase/logError";
import BetaTesterAccessModal from "@/components/BetaTesterAccessModal";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [selectedSection, setSelectedSection] = useState("beta-testers");
  const [flags, setFlags] = useState<any[]>([]);
  const [bugs, setBugs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBug, setSelectedBug] = useState<any>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedBetaTester, setSelectedBetaTester] = useState(null);
  const [showBetaTesterModal, setShowBetaTesterModal] = useState(false);
  const [betaRequests, setBetaRequests] = useState<any[]>([]);

  const openModal = (bug: unknown) => {
    setSelectedBug(bug);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBug(null);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const role = await getCurrentUserRole();
        if (role === "admin") {
          setIsAdmin(true);
          const [flagData, bugData, betaData] = await Promise.all([
            fetchFlaggedSubmissions(),
            fetchBugReports(),
            fetchBetaTesterRequests(),
          ]);
          setFlags(flagData);
          setBugs(bugData);
          setBetaRequests(betaData);
        } else {
          setIsAdmin(false);
          await logError({
            message: "Unauthorized user tried to access admin panel",
            category: "auth",
            context: { attemptedRole: role },
          });
        }
      } catch (err: unknown) {
        await logError({
          message: "Admin page failed to load data",
          category: "system",
          context: {
            error: err instanceof Error ? err.message : "Unknown error",
            stack: err instanceof Error ? err.stack : null,
          },
        });
      }
    };
    init();
  }, []);

  if (isAdmin === null) {
    return <div className="p-10 text-center">Checking admin access...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="text-center text-red-600 mt-10 text-lg">
        ❌ You are not authorized to view this page.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar selected={selectedSection} onSelect={setSelectedSection} />

      <main
        className={`flex-1 p-6 bg-gray-50 transition duration-300 ${showModal ? "blur-sm" : ""}`}
      >
        {showRemoveModal && selectedBug && (
          <RemoveBugModal
            bugId={selectedBug.bug_id}
            username={selectedBug.username}
            email={selectedBug.email}
            bugDescription={selectedBug.bug_content}
            onClose={() => setShowRemoveModal(false)}
            onRemoved={() =>
              setBugs((prev) =>
                prev.filter((b) => b.bug_id !== selectedBug.bug_id),
              )
            }
          />
        )}

        {/* Bug Report Dashboard */}
        {selectedSection === "beta-testers" && (
          <section>
            <h3 className="text-2xl font-semibold mb-4">
              Beta Tester Bug Reports
            </h3>
            {bugs.length === 0 ? (
              <p>No open bug reports.</p>
            ) : (
              <ul className="space-y-4">
                {bugs.map((bug) => (
                  <li
                    key={bug.id}
                    className="bg-white border p-4 rounded shadow-sm"
                  >
                    <p>
                      <strong>User:</strong> {bug.username}
                    </p>
                    <p>
                      <strong>Email:</strong> {bug.email}
                    </p>
                    <p>
                      <strong>Wallet Address:</strong> {bug.pubkey}
                    </p>
                    <p>
                      <strong>Description:</strong> {bug.bug_content}
                    </p>
                    {bug.created_at && (
                      <p>
                        <strong>Submitted:</strong>{" "}
                        {new Date(bug.created_at).toLocaleString()}
                      </p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        className="bg-lime-700"
                        onClick={() => openModal(bug)}
                      >
                        Issue Reward
                      </Button>
                      <Button
                        className="bg-red-800"
                        onClick={() => {
                          setSelectedBug(bug);
                          setShowRemoveModal(true);
                        }}
                      >
                        Close Bug Report
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Flagged Submission Dashboard */}
        {selectedSection === "flagged-submissions" && (
          <section>
            <h3 className="text-2xl font-semibold mb-4">Flagged Submissions</h3>
            {flags.length === 0 ? (
              <p>No flagged items.</p>
            ) : (
              <ul className="space-y-4">
                {flags.map((flag) => (
                  <li
                    key={flag.id}
                    className="bg-white border p-4 rounded shadow-sm"
                  >
                    <p>
                      <strong>Flagged By:</strong> {flag.flagged_by}
                    </p>
                    <p>
                      <strong>Type:</strong>{" "}
                      {flag.challenge_id
                        ? "Challenge"
                        : flag.submission_id
                          ? "Submission"
                          : "Unknown"}
                    </p>
                    <p>
                      <strong>Reason:</strong> {flag.reason}
                    </p>
                    {flag.challenge_id && (
                      <a
                        href={`/challenges/${flag.challenge_id}`}
                        target="_blank"
                        className="text-blue-600 underline"
                      >
                        View Challenge
                      </a>
                    )}
                    {flag.submission_id && (
                      <a
                        href={`/submissions/${flag.submission_id}`}
                        target="_blank"
                        className="text-blue-600 underline"
                      >
                        View Submission
                      </a>
                    )}
                    <p>
                      <strong>Created:</strong>{" "}
                      {flag.created_at
                        ? new Date(flag.created_at).toLocaleString()
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Resolved:</strong> {flag.resolved ? "Yes" : "No"}
                    </p>
                    {flag.resolved && (
                      <>
                        <p>
                          <strong>Resolved By:</strong> {flag.resolved_by}
                        </p>
                        <p>
                          <strong>Resolved At:</strong>{" "}
                          {flag.resolved_at
                            ? new Date(flag.resolved_at).toLocaleString()
                            : "N/A"}
                        </p>
                        <p>
                          <strong>Resolution Notes:</strong>{" "}
                          {flag.resolution_notes}
                        </p>
                      </>
                    )}
                    <div className="flex gap-2 mt-4">
                      {/* <Button
                        className="bg-lime-700"
                        onClick={() => openModal(bug)}
                      >
                        Release Submission
                      </Button>
                      <Button
                        className="bg-red-800"
                        onClick={() => {
                          setSelectedBug(bug);
                          setShowRemoveModal(true);
                        }}
                      >
                        Remove Submission
                      </Button> */}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {selectedSection === "add-beta-testers" && (
          <section>
            <h3 className="text-2xl font-semibold mb-4">
              Requests For Beta Tester Access
            </h3>

            {betaRequests.length === 0 ? (
              <p>No requests to join beta.</p>
            ) : (
              <ul className="space-y-4">
                {betaRequests.map((beta) => (
                  <li
                    key={beta.id}
                    className="bg-white border p-4 rounded shadow-sm"
                  >
                    <p>
                      <strong>User:</strong> {beta.username}
                    </p>
                    <p>
                      <strong>Email:</strong> {beta.email}
                    </p>
                    <p>
                      <strong>Wallet Address:</strong> {beta.pubkey}
                    </p>
                    <p>
                      <strong>Role:</strong> {beta.role}
                    </p>
                    {beta.approve_date && (
                      <p>
                        <strong>Requested:</strong>{" "}
                        {new Date(beta.approve_date).toLocaleString()}
                      </p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        className="bg-lime-700"
                        onClick={() => {
                          setSelectedBetaTester(beta);
                          setShowBetaTesterModal(true);
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        className="bg-red-800"
                        onClick={() => {
                          setSelectedBetaTester(beta);
                          setShowRemoveModal(true); // if you plan to use it for denial
                        }}
                      >
                        Deny
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
      {showModal && selectedBug && (
        <BetaTesterPayoutModal
          pubkey={selectedBug.pubkey}
          onClose={closeModal}
          bugId={selectedBug.bug_id}
        />
      )}
      {showBetaTesterModal && selectedBetaTester && (
        <BetaTesterAccessModal
          username={selectedBetaTester.username}
          email={selectedBetaTester.email}
          userId={selectedBetaTester.user_id}
          onClose={() => setShowBetaTesterModal(false)}
          onApproved={() =>
            setBetaRequests((prev) =>
              prev.filter((b) => b.user_id !== selectedBetaTester.user_id),
            )
          }
        />
      )}
    </div>
  );
}
