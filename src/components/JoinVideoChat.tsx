import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Monitor, 
  Settings, 
  Users, 
  Record,
  Square,
  Broadcast,
  Camera,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Share,
  MessageSquare,
  Send,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import io, { Socket } from 'socket.io-client';
import OBSWebSocket from 'obs-websocket-js';
// @ts-ignore - webrtc-adapter doesn't have proper types
import adapter from 'webrtc-adapter';

interface Participant {
  id: string;
  name: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  stream?: MediaStream;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
}

interface JoinVideoChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinVideoChat: React.FC<JoinVideoChatProps> = ({ isOpen, onClose }) => {
  // Connection States
  const [socket, setSocket] = useState<Socket | null>(null);
  const [obsWebSocket, setObsWebSocket] = useState<OBSWebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  
  // Media States
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Recording & Streaming States
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [obsConnected, setObsConnected] = useState(false);
  const [obsScenes, setObsScenes] = useState<string[]>([]);
  const [selectedScene, setSelectedScene] = useState('');
  
  // Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  // UI States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  // Initialize WebSocket connection
  useEffect(() => {
    if (isOpen && !socket) {
      // In a real implementation, replace with your WebSocket server URL
      const newSocket = io('ws://localhost:3001', {
        transports: ['websocket']
      });
      
      newSocket.on('connect', () => {
        console.log('Connected to signaling server');
        setIsConnected(true);
      });
      
      newSocket.on('participant-joined', (participant: Participant) => {
        setParticipants(prev => [...prev, participant]);
        toast({
          title: "Participant Joined",
          description: `${participant.name} joined the call`,
        });
      });
      
      newSocket.on('participant-left', (participantId: string) => {
        setParticipants(prev => prev.filter(p => p.id !== participantId));
        toast({
          title: "Participant Left",
          description: "A participant left the call",
        });
      });
      
      newSocket.on('chat-message', (message: ChatMessage) => {
        setChatMessages(prev => [...prev, message]);
      });
      
      setSocket(newSocket);
    }
    
    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [isOpen]);

  // Initialize OBS WebSocket connection
  const connectToOBS = async () => {
    try {
      const obs = new OBSWebSocket();
      await obs.connect('ws://127.0.0.1:4455', 'your-password');
      
      setObsWebSocket(obs);
      setObsConnected(true);
      
      // Get available scenes
      const { scenes } = await obs.call('GetSceneList');
      setObsScenes(scenes.map((scene: any) => scene.sceneName));
      
      toast({
        title: "OBS Connected",
        description: "Successfully connected to OBS Studio",
      });
    } catch (error) {
      console.error('Failed to connect to OBS:', error);
      toast({
        title: "OBS Connection Failed",
        description: "Make sure OBS is running with WebSocket enabled",
        variant: "destructive",
      });
    }
  };

  // Initialize local media stream
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Failed to get media:', error);
      toast({
        title: "Media Access Failed",
        description: "Could not access camera or microphone",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Join room
  const joinRoom = async () => {
    if (!roomId || !userName) {
      toast({
        title: "Missing Information",
        description: "Please enter both room ID and your name",
        variant: "destructive",
      });
      return;
    }

    try {
      await initializeMedia();
      
      if (socket) {
        socket.emit('join-room', {
          roomId,
          userName,
          isVideoEnabled,
          isAudioEnabled
        });
        
        toast({
          title: "Joined Room",
          description: `Connected to room: ${roomId}`,
        });
      }
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  // Leave room
  const leaveRoom = () => {
    if (socket) {
      socket.emit('leave-room', { roomId });
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    setParticipants([]);
    setRoomId('');
    
    toast({
      title: "Left Room",
      description: "You have left the video call",
    });
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        
        if (socket) {
          socket.emit('toggle-video', { enabled: videoTrack.enabled });
        }
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        if (socket) {
          socket.emit('toggle-audio', { enabled: audioTrack.enabled });
        }
      }
    }
  };

  // Screen sharing
  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing, return to camera
        await initializeMedia();
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { width: 1920, height: 1080 },
          audio: true
        });
        
        setLocalStream(screenStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
        
        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          initializeMedia();
        };
      }
    } catch (error) {
      console.error('Screen share failed:', error);
      toast({
        title: "Screen Share Failed",
        description: "Could not start screen sharing",
        variant: "destructive",
      });
    }
  };

  // Start recording with OBS
  const startRecording = async () => {
    if (!obsWebSocket) {
      toast({
        title: "OBS Not Connected",
        description: "Please connect to OBS first",
        variant: "destructive",
      });
      return;
    }

    try {
      await obsWebSocket.call('StartRecord');
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "OBS is now recording the stream",
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Recording Failed",
        description: "Could not start recording",
        variant: "destructive",
      });
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (!obsWebSocket) return;

    try {
      await obsWebSocket.call('StopRecord');
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: "Recording has been saved",
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // Start streaming
  const startStreaming = async () => {
    if (!obsWebSocket) {
      toast({
        title: "OBS Not Connected",
        description: "Please connect to OBS first",
        variant: "destructive",
      });
      return;
    }

    try {
      await obsWebSocket.call('StartStream');
      setIsStreaming(true);
      
      toast({
        title: "Stream Started",
        description: "Live stream is now active",
      });
    } catch (error) {
      console.error('Failed to start streaming:', error);
      toast({
        title: "Stream Failed",
        description: "Could not start streaming",
        variant: "destructive",
      });
    }
  };

  // Stop streaming
  const stopStreaming = async () => {
    if (!obsWebSocket) return;

    try {
      await obsWebSocket.call('StopStream');
      setIsStreaming(false);
      
      toast({
        title: "Stream Stopped",
        description: "Live stream has ended",
      });
    } catch (error) {
      console.error('Failed to stop streaming:', error);
    }
  };

  // Change OBS scene
  const changeScene = async (sceneName: string) => {
    if (!obsWebSocket) return;

    try {
      await obsWebSocket.call('SetCurrentProgramScene', { sceneName });
      setSelectedScene(sceneName);
      
      toast({
        title: "Scene Changed",
        description: `Switched to scene: ${sceneName}`,
      });
    } catch (error) {
      console.error('Failed to change scene:', error);
    }
  };

  // Send chat message
  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: userName,
      message: newMessage.trim(),
      timestamp: new Date()
    };

    socket.emit('chat-message', message);
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  // Scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-background border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            Join Video Chat
          </h1>
          {roomId && (
            <Badge variant="secondary">Room: {roomId}</Badge>
          )}
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowChat(!showChat)}
            variant="outline"
            size="sm"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 bg-gray-900 relative">
          {!localStream ? (
            /* Join Room Interface */
            <div className="flex items-center justify-center h-full">
              <Card className="w-96">
                <CardHeader>
                  <CardTitle>Join Video Room</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Name</label>
                    <Input
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Room ID</label>
                    <Input
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="Enter room ID"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                      variant={isVideoEnabled ? "default" : "outline"}
                      size="sm"
                    >
                      {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                      variant={isAudioEnabled ? "default" : "outline"}
                      size="sm"
                    >
                      {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <Button onClick={joinRoom} className="w-full" disabled={!isConnected}>
                    <Phone className="h-4 w-4 mr-2" />
                    Join Room
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Video Grid */
            <div className="grid grid-cols-2 gap-2 p-4 h-full">
              {/* Local Video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {userName} (You)
                  {isScreenSharing && <Badge className="ml-2">Sharing Screen</Badge>}
                </div>
              </div>

              {/* Remote Videos */}
              {participants.map(participant => (
                <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
                  <video
                    ref={(el) => {
                      if (el) remoteVideoRefs.current.set(participant.id, el);
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {participant.name}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {!participant.isVideoEnabled && (
                      <Badge variant="destructive">
                        <VideoOff className="h-3 w-3" />
                      </Badge>
                    )}
                    {!participant.isAudioEnabled && (
                      <Badge variant="destructive">
                        <MicOff className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Video Controls */}
          {localStream && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                <Button
                  onClick={toggleVideo}
                  variant={isVideoEnabled ? "default" : "destructive"}
                  size="sm"
                >
                  {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                
                <Button
                  onClick={toggleAudio}
                  variant={isAudioEnabled ? "default" : "destructive"}
                  size="sm"
                >
                  {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                
                <Button
                  onClick={toggleScreenShare}
                  variant={isScreenSharing ? "default" : "outline"}
                  size="sm"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                
                <Button onClick={leaveRoom} variant="destructive" size="sm">
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-96 bg-background border-l flex flex-col">
          {/* OBS Controls */}
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Broadcast className="h-4 w-4" />
              OBS Studio Integration
            </h3>
            
            {!obsConnected ? (
              <Button onClick={connectToOBS} className="w-full">
                Connect to OBS
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "default"}
                    size="sm"
                    className="flex-1"
                  >
                    {isRecording ? <Square className="h-4 w-4" /> : <Record className="h-4 w-4" />}
                    {isRecording ? 'Stop' : 'Record'}
                  </Button>
                  
                  <Button
                    onClick={isStreaming ? stopStreaming : startStreaming}
                    variant={isStreaming ? "destructive" : "default"}
                    size="sm"
                    className="flex-1"
                  >
                    <Broadcast className="h-4 w-4" />
                    {isStreaming ? 'Stop' : 'Stream'}
                  </Button>
                </div>
                
                {obsScenes.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">OBS Scene</label>
                    <Select value={selectedScene} onValueChange={changeScene}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scene" />
                      </SelectTrigger>
                      <SelectContent>
                        {obsScenes.map(scene => (
                          <SelectItem key={scene} value={scene}>
                            {scene}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Participants */}
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants ({participants.length + (localStream ? 1 : 0)})
            </h3>
            
            <div className="space-y-2">
              {localStream && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">{userName} (You)</span>
                  <div className="flex gap-1 ml-auto">
                    {!isVideoEnabled && <VideoOff className="h-3 w-3 text-muted-foreground" />}
                    {!isAudioEnabled && <MicOff className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </div>
              )}
              
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">{participant.name}</span>
                  <div className="flex gap-1 ml-auto">
                    {!participant.isVideoEnabled && <VideoOff className="h-3 w-3 text-muted-foreground" />}
                    {!participant.isAudioEnabled && <MicOff className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          {showChat && (
            <div className="flex-1 flex flex-col">
              <h3 className="font-semibold p-4 pb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </h3>
              
              <div
                ref={chatContainerRef}
                className="flex-1 p-4 overflow-y-auto space-y-2"
              >
                {chatMessages.map(message => (
                  <div key={message.id} className="bg-muted/50 p-2 rounded text-sm">
                    <div className="font-medium text-xs text-muted-foreground mb-1">
                      {message.sender} • {message.timestamp.toLocaleTimeString()}
                    </div>
                    <div>{message.message}</div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinVideoChat;