import { ArrowLeft, LogOut, Settings, Heart } from 'lucide-react';

interface ProfileProps {
  onNavigate: (view: 'app' | 'login') => void;
}

export function Profile({ onNavigate }: ProfileProps) {
  // Placeholder user data
  const user = {
    name: "Jane Doe",
    email: "jane@example.com",
    skinTone: "Tan",
    favorites: [
      { id: 's04', name: 'Classic Red', hex: '#952431' },
      { id: 's02', name: 'Rosey Pink', hex: '#c86f7b' }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button 
            onClick={() => onNavigate('app')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-800 transition-colors font-medium"
          >
            <ArrowLeft size={20} /> Back to Try-On
          </button>
          <h1 className="text-2xl font-light tracking-widest text-gray-900 uppercase">Profile</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* User Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-primary-100 p-8 mb-8 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-3xl font-light uppercase">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500 mb-2">{user.email}</p>
            <span className="inline-block bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Skin Tone: {user.skinTone}
            </span>
          </div>
          <button className="p-3 text-gray-400 hover:text-primary-600 transition-colors rounded-full hover:bg-gray-50">
            <Settings size={24} />
          </button>
        </div>

        {/* Favorites Section */}
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Heart size={18} className="text-rose-500" /> Saved Favorites
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-12">
          {user.favorites.map((fav) => (
            <div key={fav.id} className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div 
                className="w-12 h-12 rounded-full shadow-inner border border-black/10"
                style={{ backgroundColor: fav.hex }}
              />
              <div>
                <p className="font-bold text-gray-900">{fav.name}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{fav.id}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => onNavigate('login')}
          className="w-full flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-600 py-4 rounded-2xl font-bold uppercase tracking-wide text-sm hover:bg-rose-50 transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>

      </div>
    </div>
  );
}

