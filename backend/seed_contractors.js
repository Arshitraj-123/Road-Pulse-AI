import mongoose from 'mongoose';
import Contractor from './src/models/Contractor.js';

const mockData = [
    {id:"C-002",name:"BharatPave Ltd.",grade:"A-",resolutionRate:91,openTickets:11,avgFixDays:3.4,slaCompliance:89,trend:[85,86,88,90,91,91],violations:1,status:"good"},
    {id:"C-003",name:"Metro Roads Co.",grade:"B+",resolutionRate:83,openTickets:22,avgFixDays:4.8,slaCompliance:81,trend:[80,79,82,83,81,83],violations:3,status:"average"},
    {id:"C-004",name:"PaveRight Corp.",grade:"D+",resolutionRate:72,openTickets:38,avgFixDays:7.2,slaCompliance:65,trend:[78,76,74,73,72,72],violations:7,status:"poor"},
    {id:"C-005",name:"CityBuild Infra",grade:"D-",resolutionRate:61,openTickets:54,avgFixDays:9.1,slaCompliance:55,trend:[70,68,65,63,62,61],violations:12,status:"poor"},
    {id:"C-006",name:"Omega Infra",grade:"RISK",resolutionRate:42,openTickets:87,avgFixDays:14.6,slaCompliance:33,trend:[58,53,50,47,44,42],violations:24,status:"critical"}
];

mongoose.connect('mongodb://127.0.0.1:27017/roadpulse').then(async () => {
  for (const c of mockData) {
    const existing = await Contractor.findOne({ licenseNumber: c.id });
    if (!existing) {
      await Contractor.create({
        companyName: c.name,
        licenseNumber: c.id,
        municipalityId: '6a2ab2cbd2b617d9a1d1facf',
        approvalStatus: 'approved',
        performance: {
          grade: c.grade,
          resolutionRate: c.resolutionRate,
          openTickets: c.openTickets,
          avgFixDays: c.avgFixDays,
          slaCompliance: c.slaCompliance,
          violations: c.violations,
          trendHistory: c.trend
        }
      });
      console.log('Seeded', c.name);
    }
  }
  process.exit(0);
}).catch(console.error);
