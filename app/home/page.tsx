'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface CardSet {
  id: string;
  name: string;
  description: string;
  cards: Card[];
  userId: string;
  createdAt: Date;
}

interface Card {
  front: string;
  back: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardSets, setCardSets] = useState<CardSet[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [currentSet, setCurrentSet] = useState<CardSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const router = useRouter();

  // New card set form
  const [newSetName, setNewSetName] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');
  const [newCards, setNewCards] = useState<Card[]>([{ front: '', back: '' }]);

  useEffect(() => {
    if (!auth) {
      router.push('/login');
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadCardSets(currentUser.uid);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadCardSets = async (userId: string) => {
    if (!db) return;
    
    try {
      const q = query(collection(db, 'cardSets'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const sets: CardSet[] = [];
      querySnapshot.forEach((doc) => {
        sets.push({ id: doc.id, ...doc.data() } as CardSet);
      });
      setCardSets(sets);
    } catch (error) {
      console.error('Error loading card sets:', error);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    try {
      const validCards = newCards.filter(card => card.front.trim() && card.back.trim());
      
      await addDoc(collection(db, 'cardSets'), {
        name: newSetName,
        description: newSetDescription,
        cards: validCards,
        userId: user.uid,
        createdAt: new Date(),
      });

      setShowCreateModal(false);
      setNewSetName('');
      setNewSetDescription('');
      setNewCards([{ front: '', back: '' }]);
      await loadCardSets(user.uid);
    } catch (error) {
      console.error('Error creating card set:', error);
    }
  };

  const handleDeleteSet = async (setId: string) => {
    if (!confirm('Are you sure you want to delete this card set?') || !db) return;
    
    try {
      await deleteDoc(doc(db, 'cardSets', setId));
      if (user) await loadCardSets(user.uid);
    } catch (error) {
      console.error('Error deleting card set:', error);
    }
  };

  const startStudying = (set: CardSet) => {
    setCurrentSet(set);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowStudyModal(true);
  };

  const nextCard = () => {
    if (currentSet && currentCardIndex < currentSet.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      setShowStudyModal(false);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const addCardInput = () => {
    setNewCards([...newCards, { front: '', back: '' }]);
  };

  const updateCard = (index: number, field: 'front' | 'back', value: string) => {
    const updated = [...newCards];
    updated[index][field] = value;
    setNewCards(updated);
  };

  const removeCard = (index: number) => {
    if (newCards.length > 1) {
      setNewCards(newCards.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark">
        <div className="text-primary-pale text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Header */}
      <header className="bg-primary-medium border-b border-primary-gray p-4 sm:p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-pale">VocApp</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-primary-pale hover:text-primary-light transition-colors text-sm sm:text-base"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-pale mb-2">My Card Sets</h2>
            <p className="text-primary-gray">Welcome back, {user?.email}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-6 py-3 bg-primary-light text-primary-pale font-semibold rounded-lg hover:bg-primary-gray transition-colors"
          >
            + Create New Set
          </button>
        </div>

        {/* Card Sets Grid */}
        {cardSets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-primary-gray text-lg mb-4">You don't have any card sets yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary-light text-primary-pale font-semibold rounded-lg hover:bg-primary-gray transition-colors"
            >
              Create Your First Set
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {cardSets.map((set) => (
              <div
                key={set.id}
                className="bg-primary-medium p-4 sm:p-6 rounded-lg border border-primary-gray hover:border-primary-light transition-colors"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-primary-pale mb-2">{set.name}</h3>
                <p className="text-primary-gray text-sm mb-4">{set.description}</p>
                <p className="text-primary-pale text-sm mb-4">{set.cards.length} cards</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => startStudying(set)}
                    className="flex-1 px-4 py-2 bg-primary-light text-primary-pale rounded hover:bg-primary-gray transition-colors text-sm"
                  >
                    Study
                  </button>
                  <button
                    onClick={() => handleDeleteSet(set.id)}
                    className="px-4 py-2 bg-red-900/30 text-red-300 rounded hover:bg-red-900/50 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-primary-medium rounded-lg p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-primary-gray">
            <h2 className="text-2xl font-bold text-primary-pale mb-6">Create New Card Set</h2>
            <form onSubmit={handleCreateSet} className="space-y-4">
              <div>
                <label className="block text-primary-pale mb-2 text-sm font-medium">Set Name</label>
                <input
                  type="text"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  className="w-full px-4 py-2 bg-primary-dark border border-primary-gray rounded text-primary-pale focus:outline-none focus:border-primary-light"
                  required
                />
              </div>
              <div>
                <label className="block text-primary-pale mb-2 text-sm font-medium">Description</label>
                <input
                  type="text"
                  value={newSetDescription}
                  onChange={(e) => setNewSetDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-primary-dark border border-primary-gray rounded text-primary-pale focus:outline-none focus:border-primary-light"
                />
              </div>

              <div>
                <label className="block text-primary-pale mb-4 text-sm font-medium">Cards</label>
                {newCards.map((card, index) => (
                  <div key={index} className="mb-4 p-4 bg-primary-dark rounded border border-primary-gray">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-primary-pale text-sm">Card {index + 1}</span>
                      {newCards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCard(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Front (e.g., Word)"
                      value={card.front}
                      onChange={(e) => updateCard(index, 'front', e.target.value)}
                      className="w-full px-3 py-2 mb-2 bg-primary-medium border border-primary-gray rounded text-primary-pale placeholder-primary-gray focus:outline-none focus:border-primary-light text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Back (e.g., Definition)"
                      value={card.back}
                      onChange={(e) => updateCard(index, 'back', e.target.value)}
                      className="w-full px-3 py-2 bg-primary-medium border border-primary-gray rounded text-primary-pale placeholder-primary-gray focus:outline-none focus:border-primary-light text-sm"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCardInput}
                  className="w-full py-2 border-2 border-dashed border-primary-gray text-primary-gray hover:border-primary-light hover:text-primary-light rounded transition-colors text-sm"
                >
                  + Add Another Card
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-light text-primary-pale font-semibold rounded hover:bg-primary-gray transition-colors"
                >
                  Create Set
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewSetName('');
                    setNewSetDescription('');
                    setNewCards([{ front: '', back: '' }]);
                  }}
                  className="flex-1 py-3 bg-primary-dark text-primary-pale rounded hover:bg-primary-gray transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Study Modal */}
      {showStudyModal && currentSet && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-medium rounded-lg p-6 sm:p-8 max-w-lg w-full border border-primary-gray">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-primary-pale mb-2">{currentSet.name}</h2>
              <p className="text-primary-gray text-sm">
                Card {currentCardIndex + 1} of {currentSet.cards.length}
              </p>
            </div>

            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="bg-primary-dark p-8 sm:p-12 rounded-lg border-2 border-primary-gray hover:border-primary-light transition-colors cursor-pointer min-h-[200px] flex items-center justify-center mb-6"
            >
              <p className="text-xl sm:text-2xl text-primary-pale text-center">
                {isFlipped
                  ? currentSet.cards[currentCardIndex].back
                  : currentSet.cards[currentCardIndex].front}
              </p>
            </div>

            <p className="text-center text-primary-gray text-sm mb-6">
              {isFlipped ? 'Click to see front' : 'Click to see back'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={previousCard}
                disabled={currentCardIndex === 0}
                className="flex-1 py-3 bg-primary-dark text-primary-pale rounded hover:bg-primary-gray transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={nextCard}
                className="flex-1 py-3 bg-primary-light text-primary-pale rounded hover:bg-primary-gray transition-colors"
              >
                {currentCardIndex === currentSet.cards.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>

            <button
              onClick={() => setShowStudyModal(false)}
              className="w-full mt-3 py-2 text-primary-gray hover:text-primary-pale transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
