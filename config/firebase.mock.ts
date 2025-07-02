// Mock Firebase implementation for web builds
const mockFirebaseApp = {
  name: 'mock-app',
  options: {}
};

const mockAuth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    callback(null);
    return () => {};
  },
  signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
  createUserWithEmailAndPassword: () => Promise.resolve({ user: null }),
  signOut: () => Promise.resolve(),
  updateProfile: () => Promise.resolve()
};

const mockDb = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false, data: () => null }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve()
    }),
    add: () => Promise.resolve({ id: 'mock-id' }),
    where: () => ({
      get: () => Promise.resolve({ docs: [] })
    })
  })
};

const mockStorage = {
  ref: () => ({
    put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('mock-url') } }),
    delete: () => Promise.resolve(),
    getDownloadURL: () => Promise.resolve('mock-url')
  })
};

export const auth = mockAuth;
export const db = mockDb;
export const storage = mockStorage;
export default mockFirebaseApp;
