"use client";
import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Divider,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";

// Assume we have a Player type defined elsewhere
type Player = {
  id: string;
  name: string;
};

interface CS2Map {
  name: string;
  image: string;
}

const CS2_MAPS: CS2Map[] = [
  { name: "Ancient", image: "/images/maps/Ancient.jpg" },
  { name: "Anubis", image: "/images/maps/Anubis.jpg" },
  { name: "Inferno", image: "/images/maps/inferno.jpeg" },
  { name: "Mirage", image: "/images/maps/Mirage.jpg" },
  { name: "Nuke", image: "/images/maps/Nuke.jpeg" },
  { name: "Vertigo", image: "/images/maps/Vertigo.jpeg" },
  { name: "Dust2", image: "/images/maps/Dust_2.jpg" },
];

interface MapVetoProps {
  mapVetoFormat: "bo1" | "bo3" | "bo5";
  captains: Player[];
  coinFlipWinner: Player | null;
  teamA: Player[]; // Add this line
  teamB: Player[]; // Add this line
}

const MapVeto: React.FC<MapVetoProps> = ({
  mapVetoFormat,
  captains,
  coinFlipWinner,
  teamA,
  teamB,
}) => {
  const [vetoedMaps, setVetoedMaps] = useState<string[]>([]);
  const [pickedMaps, setPickedMaps] = useState<string[]>([]);
  const [mapVetoTurn, setMapVetoTurn] = useState<Player | null>(null);
  const [vetoComplete, setVetoComplete] = useState(false);
  const [deciderMap, setDeciderMap] = useState<string | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);

  useEffect(() => {
    setMapVetoTurn(
      captains.find((captain) => captain.id !== coinFlipWinner?.id) || null
    );
  }, [captains, coinFlipWinner]);

  const handleMapAction = (mapName: string) => {
    if (vetoedMaps.includes(mapName) || pickedMaps.includes(mapName)) return;

    const totalActions = vetoedMaps.length + pickedMaps.length;
    let isVeto = true;

    if (mapVetoFormat === "bo1") {
      isVeto = totalActions < 6;
    } else if (mapVetoFormat === "bo3") {
      isVeto = totalActions < 2 || (totalActions >= 4 && totalActions < 6);
    } else if (mapVetoFormat === "bo5") {
      isVeto = totalActions < 2;
    }

    const newVetoedMaps = isVeto ? [...vetoedMaps, mapName] : vetoedMaps;
    const newPickedMaps = isVeto ? pickedMaps : [...pickedMaps, mapName];

    setVetoedMaps(newVetoedMaps);
    setPickedMaps(newPickedMaps);

    const remainingMaps = CS2_MAPS.filter(
      (map) =>
        !newVetoedMaps.includes(map.name) && !newPickedMaps.includes(map.name)
    );

    if (remainingMaps.length === 1) {
      // Automatically select the last remaining map as the decider
      setDeciderMap(remainingMaps[0].name);
      setPickedMaps([...newPickedMaps, remainingMaps[0].name]);
      setVetoComplete(true);
    } else {
      setMapVetoTurn(
        mapVetoTurn?.id === captains[0].id ? captains[1] : captains[0]
      );
      checkVetoComplete(newVetoedMaps, newPickedMaps);
    }
  };

  const getMapStatus = (mapName: string) => {
    if (vetoedMaps.includes(mapName)) return "Vetoed";
    if (pickedMaps.includes(mapName)) {
      if (mapName === deciderMap) return "Decider";
      return "Picked";
    }
    return "Available";
  };

  const checkVetoComplete = (
    currentVetoedMaps: string[],
    currentPickedMaps: string[]
  ) => {
    let complete = false;

    if (mapVetoFormat === "bo1" && currentVetoedMaps.length === 6) {
      complete = true;
    } else if (
      mapVetoFormat === "bo3" &&
      currentVetoedMaps.length === 4 &&
      currentPickedMaps.length === 2
    ) {
      complete = true;
    } else if (
      mapVetoFormat === "bo5" &&
      currentVetoedMaps.length === 2 &&
      currentPickedMaps.length === 4
    ) {
      complete = true;
    }

    setVetoComplete(complete);
  };

  const getCurrentAction = () => {
    const totalActions = vetoedMaps.length + pickedMaps.length;
    if (mapVetoFormat === "bo1") return "ban";
    if (mapVetoFormat === "bo3") {
      return totalActions < 2 || totalActions >= 4 ? "ban" : "pick";
    }
    if (mapVetoFormat === "bo5") {
      return totalActions < 2 ? "ban" : "pick";
    }
    return "";
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">
        Map Veto - {mapVetoFormat.toUpperCase()}
      </h3>
      {!vetoComplete && (
        <p>
          {mapVetoTurn?.name}&apos;s turn to {getCurrentAction()}
        </p>
      )}
      <div className="flex justify-between space-x-2">
        {CS2_MAPS.map((map) => (
          <button
            key={map.name}
            className={`flex-grow relative h-96 w-1/7 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 mx-2 ${
              getMapStatus(map.name) === "Vetoed"
                ? "opacity-50 scale-95"
                : getMapStatus(map.name) === "Picked" ||
                    getMapStatus(map.name) === "Decider"
                  ? "ring-4 ring-green-500 scale-100"
                  : "hover:scale-105"
            }`}
            onClick={() => handleMapAction(map.name)}
            disabled={vetoComplete || getMapStatus(map.name) !== "Available"}
          >
            <img
              alt={map.name}
              className="w-full h-full object-cover"
              src={map.image}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
              <span className="text-white font-bold text-lg">{map.name}</span>
              <span
                className={`text-sm ${
                  getMapStatus(map.name) === "Vetoed"
                    ? "text-red-500"
                    : getMapStatus(map.name) === "Picked"
                      ? "text-green-500"
                      : getMapStatus(map.name) === "Decider"
                        ? "text-yellow-500"
                        : "text-white"
                }`}
              >
                {getMapStatus(map.name)}
              </span>
            </div>
          </button>
        ))}
      </div>
      {vetoComplete && (
        <div className="mt-4 flex flex-col items-center">
          <h4 className="text-lg font-semibold">Final Map Selection:</h4>
          <ul>
            {pickedMaps.map((map, index) => (
              <li key={map}>
                Map {index + 1}: {map} {map === deciderMap ? "(Decider)" : ""}
              </li>
            ))}
          </ul>
          <Button
            color="primary"
            className="mt-4"
            onClick={() => setShowTeamModal(true)}
          >
            Proceed to Match
          </Button>
        </div>
      )}

      <Modal isOpen={showTeamModal} onClose={() => setShowTeamModal(false)}>
        <ModalContent>
          <ModalHeader>Team Rosters</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-bold mb-2 text-xl">
                  {captains[0].name}&apos;s Team
                </h5>
                <Divider />
                <ul className="mt-2">
                  <li>{captains[0].name} (Captain)</li>
                  {teamA.map((player) => (
                    <li key={player.id}>{player.name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-bold mb-2 text-xl">
                  {captains[1].name}&apos;s Team
                </h5>
                <Divider />
                <ul className="mt-2">
                  <li>{captains[1].name} (Captain)</li>
                  {teamB.map((player) => (
                    <li key={player.id}>{player.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => setShowTeamModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default function Matchmaking() {
  const [step, setStep] = useState(1);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [allPlayers, setAllPlayers] = useState<Player[]>([
    { id: "1", name: "Starku" },
    { id: "2", name: "Shona" },
    { id: "3", name: "Marky" },
    { id: "4", name: "Blackburn" },
    { id: "5", name: "Tanzee" },
    { id: "6", name: "Nero" },
    { id: "7", name: "Pain" },
    { id: "8", name: "Dante" },
    { id: "9", name: "noHuntz" },
    { id: "10", name: "LPH" },
    { id: "11", name: "Vandron" },
    { id: "12", name: "Harty" },
    { id: "13", name: "ryDer" },
    { id: "14", name: "sRs" },
  ]);
  const [captains, setCaptains] = useState<Player[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [customCaptain1, setCustomCaptain1] = useState<Player | null>(null);
  const [customCaptain2, setCustomCaptain2] = useState<Player | null>(null);
  const [coinFlipWinner, setCoinFlipWinner] = useState<Player | null>(null);
  const [teamA, setTeamA] = useState<Player[]>([]);
  const [teamB, setTeamB] = useState<Player[]>([]);
  const [currentPicker, setCurrentPicker] = useState<Player | null>(null);
  const [coinFlipChoice, setCoinFlipChoice] = useState<
    "heads" | "tails" | null
  >(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<"heads" | "tails" | null>(null);
  const coinRef = useRef<HTMLDivElement>(null);
  const [finalRotation, setFinalRotation] = useState(0);
  const [remainingPlayers, setRemainingPlayers] = useState<Player[]>([]);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [isSelectionComplete, setIsSelectionComplete] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMapVeto, setShowMapVeto] = useState(false);
  const [mapVetoFormat, setMapVetoFormat] = useState<
    "bo1" | "bo3" | "bo5" | null
  >(null);
  const [mapVetoTurn, setMapVetoTurn] = useState<Player | null>(null);

  // Add this effect to validate captains when selected players change
  useEffect(() => {
    setCaptains((prevCaptains) =>
      prevCaptains.filter((captain) =>
        selectedPlayers.some((player) => player.id === captain.id)
      )
    );
  }, [selectedPlayers]);

  // Add this effect to set initial remaining players
  useEffect(() => {
    if (selectedPlayers.length === 10 && captains.length === 2) {
      setRemainingPlayers(
        selectedPlayers.filter(
          (player) => !captains.some((captain) => captain.id === player.id)
        )
      );
    }
  }, [selectedPlayers, captains]);

  useEffect(() => {
    // Check if there are no players left to select
    const totalSelectedPlayers = teamA.length + teamB.length + captains.length;

    if (totalSelectedPlayers === selectedPlayers.length) {
      setIsSelectionComplete(true);
    } else {
      setIsSelectionComplete(false);
    }
  }, [teamA, teamB, captains, selectedPlayers]);

  const handlePlayerSelection = (player: Player) => {
    setSelectedPlayers((prev) => {
      if (prev.find((p) => p.id === player.id)) {
        return prev.filter((p) => p.id !== player.id);
      } else if (prev.length < 10) {
        return [...prev, player];
      } else {
        toast.warning("You can only select up to 10 players.");

        return prev;
      }
    });
  };

  const addNewPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
      };

      setAllPlayers((prev) => [...prev, newPlayer]);
      setNewPlayerName("");
      toast.success(`Player "${newPlayer.name}" added successfully!`);
    } else {
      toast.error("Please enter a player name before adding.");
    }
  };

  const selectRandomCaptains = () => {
    if (selectedPlayers.length < 2) {
      toast.error("You need at least 2 players to select captains.");

      return;
    }
    const shuffled = [...selectedPlayers].sort(() => 0.5 - Math.random());

    setCaptains(shuffled.slice(0, 2));
  };

  const handleCustomCaptainSelection = () => {
    if (
      customCaptain1 &&
      customCaptain2 &&
      selectedPlayers.some((p) => p.id === customCaptain1.id) &&
      selectedPlayers.some((p) => p.id === customCaptain2.id)
    ) {
      setCaptains([customCaptain1, customCaptain2]);
      onClose();
      toast.success("Custom captains have been selected!");
    } else {
      toast.error("Please select valid captains before confirming.");
    }
  };

  const handleCoinFlip = (choice: "heads" | "tails") => {
    setCoinFlipChoice(choice);
    setIsFlipping(true);
    setCoinResult(null);
    setShowPlayerSelection(false);

    const result = Math.random() < 0.5 ? "heads" : "tails";
    const rotations = Math.floor(Math.random() * 5) + 10; // Random number of full rotations (10-14)
    const finalRotation =
      result === "heads" ? rotations * 360 : rotations * 360 + 180;

    setFinalRotation(finalRotation);

    setTimeout(() => {
      setCoinResult(result);
      const winner = result === choice ? captains[0] : captains[1];

      setCoinFlipWinner(winner);
      setCurrentPicker(winner);
      setIsFlipping(false);
      setRemainingPlayers(
        selectedPlayers.filter(
          (player) => !captains.some((captain) => captain.id === player.id)
        )
      );
      toast.success(`${winner.name} won the coin toss and will pick first!`);

      setTimeout(() => {
        setShowPlayerSelection(true);
      }, 4000);
    }, 5000);
  };

  const handlePlayerPick = (player: Player) => {
    if (!currentPicker) return;

    const newTeam =
      currentPicker === captains[0] ? [...teamA, player] : [...teamB, player];
    const newRemainingPlayers = remainingPlayers.filter(
      (p) => p.id !== player.id
    );

    if (currentPicker === captains[0]) {
      setTeamA(newTeam);
    } else {
      setTeamB(newTeam);
    }

    setRemainingPlayers(newRemainingPlayers);
    setCurrentPicker(currentPicker === captains[0] ? captains[1] : captains[0]);

    // Check if all players have been picked
    if (teamA.length + teamB.length + 2 === selectedPlayers.length) {
      // +2 for captains
      setIsSelectionComplete(true);
    }
  };

  const handlePlayerReturn = (player: Player, team: "A" | "B") => {
    setRemainingPlayers([...remainingPlayers, player]);
    if (team === "A") {
      setTeamA(teamA.filter((p) => p.id !== player.id));
    } else {
      setTeamB(teamB.filter((p) => p.id !== player.id));
    }
    // Optionally, you might want to adjust the current picker here
    // setCurrentPicker(team === "A" ? captains[0] : captains[1]);
  };

  const resetTeamSelectionStates = () => {
    setCoinFlipWinner(null);
    setCoinFlipChoice(null);
    setIsFlipping(false);
    setCoinResult(null);
    setTeamA([]);
    setTeamB([]);
    setCurrentPicker(null);
    setRemainingPlayers([]);
  };

  const handleStepChange = (newStep: number) => {
    if (newStep < step) {
      // Going back
      if (step === 3) {
        resetTeamSelectionStates();
      }
    }
    setStep(newStep);
  };

  const isCoinFlipping =
    step === 3 && !coinFlipWinner && (isFlipping || coinFlipChoice !== null);

  const shouldShowButtons = () => {
    if (isCoinFlipping) return false;
    if (step === 3 && coinFlipWinner && !showPlayerSelection) return false;

    return true;
  };

  const handleConfirmSelection = () => {
    setShowConfirmModal(true);
  };

  const handleProceedToMapVeto = () => {
    setShowConfirmModal(false);
    setShowMapVeto(true);
  };

  const handleSelectMapVetoFormat = (format: "bo1" | "bo3" | "bo5") => {
    setMapVetoFormat(format);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <div className="w-full max-w-7xl space-y-6">
        {" "}
        {/* Changed to max-w-7xl for more width */}
        <h1 className="text-3xl font-bold text-center">CS-2 Matchmaking</h1>
        <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
          {showMapVeto ? (
            mapVetoFormat ? (
              <MapVeto
                mapVetoFormat={mapVetoFormat}
                captains={captains}
                coinFlipWinner={coinFlipWinner}
                teamA={teamA} // Add this line
                teamB={teamB} // Add this line
              />
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  Select Map Veto Format
                </h3>
                <div className="flex space-x-4">
                  <Button onClick={() => handleSelectMapVetoFormat("bo1")}>
                    Best of 1
                  </Button>
                  <Button onClick={() => handleSelectMapVetoFormat("bo3")}>
                    Best of 3
                  </Button>
                  <Button onClick={() => handleSelectMapVetoFormat("bo5")}>
                    Best of 5
                  </Button>
                </div>
              </div>
            )
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-6">
                Step {step}:{" "}
                {step === 1
                  ? "Select Players"
                  : step === 2
                    ? "Choose Captains"
                    : "Final Step"}
              </h2>
              {step === 1 ? (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Add New Player</h3>
                    <div className="flex space-x-2">
                      <Input
                        className="flex-grow"
                        placeholder="Enter player name"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                      />
                      <Button color="primary" onClick={addNewPlayer}>
                        Add
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Available Players
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-4">
                      {allPlayers.map((player) => (
                        <Checkbox
                          key={player.id}
                          className="text-white mx-1"
                          classNames={{
                            label: "text-white",
                            wrapper: "mr-2",
                          }}
                          isSelected={selectedPlayers.some(
                            (p) => p.id === player.id
                          )}
                          onValueChange={() => handlePlayerSelection(player)}
                        >
                          {player.name}
                        </Checkbox>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Selected Players ({selectedPlayers.length}/10)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="bg-gray-700 p-2 rounded"
                        >
                          {player.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : step === 2 ? (
                <div className="space-y-8">
                  <div>
                    <div className="space-x-4 flex justify-center">
                      <Button color="primary" onClick={selectRandomCaptains}>
                        {captains.length === 2
                          ? "Reselect Random Captains"
                          : "Generate Random Captains"}
                      </Button>
                      <Button color="secondary" onClick={onOpen}>
                        Custom Captain Selection
                      </Button>
                    </div>
                  </div>

                  {captains.length === 2 && (
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-medium mb-4">
                        Selected Captains
                      </h3>
                      <div className="text-2xl font-bold">
                        {captains[0].name}{" "}
                        <span className="text-4xl text-orange-500">vs</span>{" "}
                        {captains[1].name}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      All Selected Players
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="bg-gray-700 p-2 rounded"
                        >
                          {player.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalContent>
                      <ModalHeader>Select Custom Captains</ModalHeader>
                      <ModalBody>
                        <div className="flex justify-center space-x-10">
                          <div>
                            <label
                              className="block mb-2 text-sm text-center font-medium"
                              htmlFor="captainA"
                            >
                              Captain A
                            </label>
                            <Dropdown>
                              <DropdownTrigger>
                                <Button
                                  className="flex items-center justify-between"
                                  id="captainA"
                                >
                                  <span>
                                    {customCaptain1
                                      ? customCaptain1.name
                                      : "Select Captain A"}
                                  </span>
                                  <span className="ml-2">▼</span>
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu>
                                {selectedPlayers
                                  .filter(
                                    (player) => player.id !== customCaptain2?.id
                                  )
                                  .map((player) => (
                                    <DropdownItem
                                      key={player.id}
                                      onClick={() => setCustomCaptain1(player)}
                                    >
                                      {player.name}
                                    </DropdownItem>
                                  ))}
                              </DropdownMenu>
                            </Dropdown>
                          </div>

                          <div>
                            <label
                              className="block mb-2 text-sm text-center font-medium"
                              htmlFor="captainB"
                            >
                              Captain B
                            </label>
                            <Dropdown>
                              <DropdownTrigger>
                                <Button
                                  className="flex items-center justify-between"
                                  id="captainB"
                                >
                                  <span>
                                    {customCaptain2
                                      ? customCaptain2.name
                                      : "Select Captain B"}
                                  </span>
                                  <span className="ml-2">▼</span>
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu>
                                {selectedPlayers
                                  .filter(
                                    (player) => player.id !== customCaptain1?.id
                                  )
                                  .map((player) => (
                                    <DropdownItem
                                      key={player.id}
                                      onClick={() => setCustomCaptain2(player)}
                                    >
                                      {player.name}
                                    </DropdownItem>
                                  ))}
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </div>
                      </ModalBody>
                      <ModalFooter>
                        <Button color="danger" onClick={onClose}>
                          Cancel
                        </Button>
                        <Button
                          color="primary"
                          onClick={handleCustomCaptainSelection}
                        >
                          Confirm
                        </Button>
                      </ModalFooter>
                    </ModalContent>
                  </Modal>
                </div>
              ) : (
                step === 3 && (
                  <div className="space-y-6">
                    {!coinFlipWinner ? (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">
                          Coin Flip
                        </h3>
                        <p>{captains[0].name} chooses:</p>
                        <div className="flex justify-center space-x-4 mb-4">
                          <Button
                            disabled={isFlipping || coinFlipChoice !== null}
                            onClick={() => handleCoinFlip("heads")}
                          >
                            Heads
                          </Button>
                          <Button
                            disabled={isFlipping || coinFlipChoice !== null}
                            onClick={() => handleCoinFlip("tails")}
                          >
                            Tails
                          </Button>
                        </div>
                        {coinFlipChoice && (
                          <p>
                            {captains[1].name} gets:{" "}
                            {coinFlipChoice === "heads" ? "Tails" : "Heads"}
                          </p>
                        )}
                        <div
                          className="coin"
                          style={{
                            transform: isFlipping
                              ? `rotateY(${finalRotation}deg)`
                              : "rotateY(0deg)",
                            transition: isFlipping
                              ? "transform 5s ease-out"
                              : "none",
                          }}
                        >
                          <div className="side heads">H</div>
                          <div className="side tails">T</div>
                        </div>
                        {coinResult && <p>Result: {coinResult}</p>}
                      </div>
                    ) : showPlayerSelection ? (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold mb-4">
                          Team Selection
                        </h3>
                        <p className="text-lg">
                          {currentPicker?.name}&apos;s turn to pick
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                          {remainingPlayers.map((player) => (
                            <Button
                              key={player.id}
                              className="w-full"
                              color="primary"
                              onClick={() => handlePlayerPick(player)}
                            >
                              {player.name}
                            </Button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-6 mt-8">
                          <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-medium mb-3 text-center">
                              {captains[0].name}&apos;s Team
                            </h4>
                            <ul className="space-y-2">
                              <li className="font-semibold">
                                {captains[0].name} (Captain)
                              </li>
                              {teamA.map((player) => (
                                <li key={player.id}>
                                  <button
                                    className="w-full text-left cursor-pointer hover:text-blue-300"
                                    onClick={() =>
                                      handlePlayerReturn(player, "A")
                                    }
                                  >
                                    {player.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-medium mb-3 text-center">
                              {captains[1].name}&apos;s Team
                            </h4>
                            <ul className="space-y-2">
                              <li className="font-semibold">
                                {captains[1].name} (Captain)
                              </li>
                              {teamB.map((player) => (
                                <li key={player.id}>
                                  <button
                                    className="w-full text-left cursor-pointer hover:text-blue-300"
                                    onClick={() =>
                                      handlePlayerReturn(player, "B")
                                    }
                                  >
                                    {player.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <h3 className="text-xl font-semibold mb-4">
                          Coin Flip Result
                        </h3>
                        <p className="text-lg">
                          {coinFlipWinner.name} won the toss!
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}
            </>
          )}
        </div>
        {!showMapVeto && shouldShowButtons() && (
          <div className="flex justify-between w-full">
            {step > 1 && (
              <Button
                color="secondary"
                variant="bordered"
                onClick={() => handleStepChange(step - 1)}
              >
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                className={step === 1 ? "w-full" : ""}
                color="success"
                disabled={
                  (step === 1 && selectedPlayers.length !== 10) ||
                  (step === 2 && captains.length !== 2)
                }
                onClick={() => handleStepChange(step + 1)}
              >
                Next Step
              </Button>
            ) : (
              isSelectionComplete && (
                <Button
                  className={step === 1 ? "w-full" : ""}
                  color="primary"
                  onClick={handleConfirmSelection}
                >
                  Confirm Selection
                </Button>
              )
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Confirm Team Selection
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to proceed to the map veto?</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button color="primary" onClick={handleProceedToMapVeto}>
              Proceed to Map Veto
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
