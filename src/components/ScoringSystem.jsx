import React from 'react';

const ScoringSystem = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Bodovací systém</h2>
      
      <div className="space-y-6">
        <div className="border-l-4 border-green-500 pl-4">
          <h3 className="text-lg font-semibold text-green-700">5 bodů</h3>
          <p className="text-gray-600">Přesný tip výsledku zápasu</p>
          <p className="text-sm text-gray-500 mt-1">Například: Tip 3:2, skutečný výsledek 3:2</p>
        </div>

        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-lg font-semibold text-blue-700">2 body</h3>
          <p className="text-gray-600">Správný tip vítěze zápasu nebo remízy</p>
          <p className="text-sm text-gray-500 mt-1">Například: Tip 3:1, skutečný výsledek 2:1 (správně určen vítěz)</p>
        </div>

        <div className="border-l-4 border-red-500 pl-4">
          <h3 className="text-lg font-semibold text-red-700">0 bodů</h3>
          <p className="text-gray-600">Špatný tip vítěze nebo remízy</p>
          <p className="text-sm text-gray-500 mt-1">Například: Tip 2:1, skutečný výsledek 1:2</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Důležitá pravidla</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Tipy lze zadávat pouze do 5 minut před začátkem zápasu</li>
            <li>Body se připisují automaticky po zadání výsledku</li>
            <li>Tip nelze po začátku zápasu měnit</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScoringSystem;
