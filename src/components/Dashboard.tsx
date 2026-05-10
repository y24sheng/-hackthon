import { UserProfile } from '../types';
import { MotherDashboard } from './MotherDashboard';
import { DaughterDashboard } from './DaughterDashboard';
import { ChallengeSection } from './ChallengeSection';

interface DashboardProps {
  profile: UserProfile;
}

export function Dashboard({ profile }: DashboardProps) {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {profile.role === 'mother' ? (
          <MotherDashboard profile={profile} />
        ) : (
          <DaughterDashboard profile={profile} />
        )}
      </div>
      <aside className="px-6 py-10 lg:pl-0">
        <ChallengeSection profile={profile} />
      </aside>
    </div>
  );
}
