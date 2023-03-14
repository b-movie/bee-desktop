declare global {
  interface Window {
    __BEE__: any;
  }
}

const Welcome = () => {
  return (
    <div className="flex bg-primary w-[100vw] h-[100vh]">
      <a href="http://localhost:3000" className="m-auto btn btn-primary btn-lg">
        Start
      </a>
    </div>
  );
};

const App = () => {
  return <Welcome />;
};

export default App;
