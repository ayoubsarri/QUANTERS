const fs = require('fs');

const file = 'src/app/admin/proposals/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Change initial state to Submitted instead of All
code = code.replace(
  'const [stateFilter, setStateFilter] = useState<string>("All");',
  'const [stateFilter, setStateFilter] = useState<ProposalState>("Submitted");'
);

// 2. Change matching logic
code = code.replace(
  'const matchesState = stateFilter === "All" || p.state === stateFilter;',
  'const matchesState = p.state === stateFilter;'
);

// 3. Remove "All" from UI buttons
code = code.replace(
  `{["All", ...PROPOSAL_STATES].map((st) => (`,
  `{PROPOSAL_STATES.map((st) => (`
);

fs.writeFileSync(file, code, 'utf8');
console.log('Successfully updated proposals filter (removed All)!');
