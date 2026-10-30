import fs from 'fs';

let content = fs.readFileSync('src/lib/store/useQuantersStore.ts', 'utf8');

const oldSubmitProposal = `  submitProposal: (proposal) =>
    set((state) => {
      const member = state.members.find((m) => m.id === state.currentMemberId);
      const reviewerScope =
        proposal.type === "Internal Law Amendment"
          ? "Executive Board (2/3 Quorum)"
          : proposal.type === "Event" || proposal.type === "Collaboration"
          ? "Executive Board"
          : "Department Head";

      const newProp: Proposal = {
        id: \`prop-\${Date.now()}\`,
        type: proposal.type,
        title: proposal.title,
        description: proposal.description,
        submitterId: state.currentMemberId,
        submitterName: member?.fullName || "QUANTA Member",
        expectedDate: proposal.expectedDate,
        location: proposal.location,
        specificFields: proposal.specificFields,
        state: "Submitted",
        reviewerScope,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return { proposals: [newProp, ...state.proposals] };
    }),

  reviewProposal: (proposalId, newState, comment, convertToWorkshop = false) =>
    set((state) => {
      const prop = state.proposals.find((p) => p.id === proposalId);
      if (!prop) return state;

      const audit: AuditLogEntry = {
        id: \`aud-\${Date.now()}\`,
        actorName: "Executive / Head Reviewer",
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Proposal Decision",
        targetLabel: \`\${prop.type}: \${prop.title}\`,
        oldValue: prop.state,
        newValue: convertToWorkshop ? "Approved & Converted to Workshop" : newState,
        reason: comment,
      };

      const newWorkshops =
        convertToWorkshop && newState === "Approved"
          ? [
              {
                id: \`ws-conv-\${Date.now()}\`,
                title: prop.title,
                category: "General" as const,
                iconType: "python" as const,
                level: (prop.specificFields.level as WorkshopLevel) || "Beginner",
                instructor: prop.specificFields.instructor || prop.submitterName,
                dateLabel: prop.expectedDate || "Upcoming",
                timeRange: "14:00 - 17:00",
                location: prop.location || "Faculty of Sciences",
                capacity: Number(prop.specificFields.capacity) || 30,
                seatsLeft: Number(prop.specificFields.capacity) || 30,
                xpReward: 120,
                status: "Published" as const,
                description: prop.description,
                objectives: [prop.specificFields.objectives || "Converted from approved member proposal"],
                materials: [prop.specificFields.materialsNeeded || "Standard kit"],
                liveQrToken: \`QUANTA-PROP-\${Date.now()}\`,
                liveSixDigitCode: String(Math.floor(100000 + Math.random() * 900000)),
                registeredMemberIds: [],
                waitlistMemberIds: [],
                attendanceRecords: [],
              },
              ...state.workshops,
            ]
          : state.workshops;

      return {
        proposals: state.proposals.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                state: newState,
                reviewerComment: comment,
                convertedToId: convertToWorkshop ? \`ws-conv\` : p.convertedToId,
              }
            : p
        ),
        workshops: newWorkshops,
        auditLogs: [audit, ...state.auditLogs],
      };
    }),`;

const newSubmitProposal = `  submitProposal: (proposal) => {
    set((state) => {
      const member = state.members.find((m) => m.id === state.currentMemberId);
      const reviewerScope =
        proposal.type === "Internal Law Amendment"
          ? "Executive Board (2/3 Quorum)"
          : proposal.type === "Event" || proposal.type === "Collaboration"
          ? "Executive Board"
          : "Department Head";

      const newProp: Proposal = {
        id: \`prop-\${Date.now()}\`,
        type: proposal.type,
        title: proposal.title,
        description: proposal.description,
        submitterId: state.currentMemberId,
        submitterName: member?.fullName || "QUANTA Member",
        expectedDate: proposal.expectedDate,
        location: proposal.location,
        specificFields: proposal.specificFields,
        state: "Submitted",
        reviewerScope,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return { proposals: [newProp, ...state.proposals] };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },

  reviewProposal: (proposalId, newState, comment, convertToWorkshop = false) => {
    set((state) => {
      const prop = state.proposals.find((p) => p.id === proposalId);
      if (!prop) return state;

      const audit: AuditLogEntry = {
        id: \`aud-\${Date.now()}\`,
        actorName: "Executive / Head Reviewer",
        actorRole: state.activeAdminRole,
        timestamp: nowStamp(),
        actionCategory: "Proposal Decision",
        targetLabel: \`\${prop.type}: \${prop.title}\`,
        oldValue: prop.state,
        newValue: convertToWorkshop ? "Approved & Converted to Workshop" : newState,
        reason: comment,
      };

      const newWorkshops =
        convertToWorkshop && newState === "Approved"
          ? [
              {
                id: \`ws-conv-\${Date.now()}\`,
                title: prop.title,
                category: "General" as const,
                iconType: "python" as const,
                level: (prop.specificFields.level as WorkshopLevel) || "Beginner",
                instructor: prop.specificFields.instructor || prop.submitterName,
                dateLabel: prop.expectedDate || "Upcoming",
                timeRange: "14:00 - 17:00",
                location: prop.location || "Faculty of Sciences",
                capacity: Number(prop.specificFields.capacity) || 30,
                seatsLeft: Number(prop.specificFields.capacity) || 30,
                xpReward: 120,
                status: "Published" as const,
                description: prop.description,
                objectives: [prop.specificFields.objectives || "Converted from approved member proposal"],
                materials: [prop.specificFields.materialsNeeded || "Standard kit"],
                liveQrToken: \`QUANTA-PROP-\${Date.now()}\`,
                liveSixDigitCode: String(Math.floor(100000 + Math.random() * 900000)),
                registeredMemberIds: [],
                waitlistMemberIds: [],
                attendanceRecords: [],
              },
              ...state.workshops,
            ]
          : state.workshops;

      return {
        proposals: state.proposals.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                state: newState,
                reviewerComment: comment,
                convertedToId: convertToWorkshop ? \`ws-conv\` : p.convertedToId,
              }
            : p
        ),
        workshops: newWorkshops,
        auditLogs: [audit, ...state.auditLogs],
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },`;

content = content.replace(oldSubmitProposal.replace(/\r?\n/g, '\r\n'), newSubmitProposal.replace(/\r?\n/g, '\r\n'));
fs.writeFileSync('src/lib/store/useQuantersStore.ts', content, 'utf8');
console.log('Successfully updated proposals sync in store!');
