import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">AgentSOLVR V4 - Simple Test</h1>
      <div className="space-y-4">
        <p className="text-xl">✅ React is working!</p>
        <p className="text-lg">🎯 Core functionality test</p>
        
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-2xl mb-2">Pricing Plans</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-600 p-4 rounded">
              <h3 className="font-bold">Starter</h3>
              <p className="text-2xl">$39/month</p>
            </div>
            <div className="bg-purple-600 p-4 rounded">
              <h3 className="font-bold">Professional</h3>
              <p className="text-2xl">$99/month</p>
            </div>
            <div className="bg-green-600 p-4 rounded">
              <h3 className="font-bold">Enterprise</h3>
              <p className="text-2xl">$299/month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-2xl mb-2">Test Registration Form</h2>
          <form className="space-y-4">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full p-2 bg-gray-700 rounded"
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full p-2 bg-gray-700 rounded"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;