const fs = require('fs');

const file = 'src/app/(mobile)/workshops/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'type WorkshopFilter = "All" | "Upcoming" | "Completed" | "Mine";\n\nconst FILTER_TABS: WorkshopFilter[] = ["All", "Upcoming", "Completed", "Mine"];',
  'type WorkshopFilter = "Upcoming" | "Completed" | "Mine";\n\nconst FILTER_TABS: WorkshopFilter[] = ["Upcoming", "Completed", "Mine"];'
);

code = code.replace(
  'const [filter, setFilter] = useState<WorkshopFilter>("All");',
  'const [filter, setFilter] = useState<WorkshopFilter>("Upcoming");'
);

code = code.replace(
  `const tabLabel = isRtl\n              ? (tab === "All" ? t.workshops.allFilter : tab === "Upcoming" ? t.workshops.upcomingFilter : tab === "Completed" ? t.workshops.completedFilter : t.workshops.registeredFilter)\n              : tab;`,
  `const tabLabel = isRtl\n              ? (tab === "Upcoming" ? t.workshops.upcomingFilter : tab === "Completed" ? t.workshops.completedFilter : t.workshops.registeredFilter)\n              : tab;`
);

fs.writeFileSync(file, code, 'utf8');
console.log('Successfully updated workshops filter (removed All)!');
