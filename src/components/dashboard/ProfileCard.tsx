import { User, Copy, Users } from 'lucide-react'

interface SponsorInfo {
  id: string
  name: string
}

interface ProfileCardProps {
  personId: string
  personName: string
  sponsor?: SponsorInfo
  enroller?: SponsorInfo
  onPersonClick?: (person: SponsorInfo) => void
  onSponsorClick?: (sponsor: SponsorInfo) => void
  onEnrollerClick?: (enroller: SponsorInfo) => void
}

export function ProfileCard({ personId, personName, sponsor, enroller, onPersonClick, onSponsorClick, onEnrollerClick }: ProfileCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <button
            onClick={() => onPersonClick?.({ id: personId, name: personName })}
            className="font-bold text-lg text-gray-800 hover:text-green-600 hover:underline transition-colors text-left"
          >
            {personName}
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>ID: {personId}</span>
            <button
              onClick={() => copyToClipboard(personId)}
              className="hover:text-gray-700 transition-colors"
            >
              <Copy className="h-3 w-3" />
            </button>
            <button className="hover:text-gray-700 transition-colors">
              <Users className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-2 mt-auto">
        {sponsor && (
          <div>
            <span className="text-xs text-gray-500">Sponsor</span>
            <button
              onClick={() => onSponsorClick?.(sponsor)}
              className="text-sm font-medium text-gray-800 hover:text-green-600 hover:underline transition-colors text-left block"
            >
              {sponsor.name}
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>ID: {sponsor.id}</span>
              <button
                onClick={() => copyToClipboard(sponsor.id)}
                className="hover:text-gray-700 transition-colors"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {enroller && (
          <div>
            <span className="text-xs text-gray-500">Enroller</span>
            <button
              onClick={() => onEnrollerClick?.(enroller)}
              className="text-sm font-medium text-gray-800 hover:text-green-600 hover:underline transition-colors text-left block"
            >
              {enroller.name}
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>ID: {enroller.id}</span>
              <button
                onClick={() => copyToClipboard(enroller.id)}
                className="hover:text-gray-700 transition-colors"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
