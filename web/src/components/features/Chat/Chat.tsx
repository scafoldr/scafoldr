const Chat = () => (
  <div className="join w-full">
    <div className="w-full">
      <label className="input input-xl w-full validator join-item">
        <input type="text" placeholder="Describe your database" required />
      </label>
    </div>
    <button className="btn btn-xl btn-neutral join-item">Ask</button>
  </div>
);

export default Chat;
