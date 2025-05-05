const DebugMatch = ({ match }) => {
  return (
    <div className="bg-gray-100 p-4 rounded mt-4 font-mono text-sm">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <pre>{JSON.stringify(match, null, 2)}</pre>
    </div>
  );
};

export default DebugMatch;
